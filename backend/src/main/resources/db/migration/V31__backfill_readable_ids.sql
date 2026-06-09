-- US-1604: back-fill readable_ids for all existing tasks and issues
-- Tasks: derive workspace via column→board; issues: via parent_card→column→board.
-- Standalone issues (no parent card): use fallback workspace if one exists.

DO $$
DECLARE
    fallback_ws UUID;
BEGIN
    -- Resolve a fallback workspace for standalone issues that lack a parent card.
    SELECT id INTO fallback_ws FROM workspaces ORDER BY created_at LIMIT 1;

    -- ── Tasks ────────────────────────────────────────────────────────────────
    WITH ranked_tasks AS (
        SELECT
            t.id,
            t.type,
            b.workspace_id,
            ROW_NUMBER() OVER (PARTITION BY b.workspace_id, t.type ORDER BY t.created_at) AS rn
        FROM tasks t
        JOIN columns  c ON c.id = t.column_id
        JOIN boards   b ON b.id = c.board_id
        WHERE t.readable_id IS NULL
          AND b.workspace_id IS NOT NULL
    )
    UPDATE tasks
    SET readable_id = CASE rt.type
            WHEN 'STORY'   THEN 'US-'
            WHEN 'FEATURE' THEN 'FEAT-'
            ELSE                 'BUG-'
        END || LPAD(rt.rn::TEXT, 3, '0')
    FROM ranked_tasks rt
    WHERE tasks.id = rt.id;

    -- ── Issues with parent card ───────────────────────────────────────────────
    WITH ranked_issues AS (
        SELECT
            i.id,
            i.type,
            b.workspace_id,
            ROW_NUMBER() OVER (PARTITION BY b.workspace_id, i.type ORDER BY i.created_at) AS rn
        FROM issues  i
        JOIN tasks   pc ON pc.id = i.parent_card_id
        JOIN columns c  ON c.id  = pc.column_id
        JOIN boards  b  ON b.id  = c.board_id
        WHERE i.readable_id IS NULL
    )
    UPDATE issues
    SET readable_id = CASE ri.type
            WHEN 'STORY'   THEN 'US-'
            WHEN 'FEATURE' THEN 'FEAT-'
            ELSE                 'BUG-'
        END || LPAD(ri.rn::TEXT, 3, '0')
    FROM ranked_issues ri
    WHERE issues.id = ri.id;

    -- ── Standalone issues (no parent card) ───────────────────────────────────
    IF fallback_ws IS NOT NULL THEN
        WITH ranked_standalone AS (
            SELECT
                i.id,
                i.type,
                ROW_NUMBER() OVER (PARTITION BY i.type ORDER BY i.created_at) AS rn
            FROM issues i
            WHERE i.parent_card_id IS NULL AND i.readable_id IS NULL
        )
        UPDATE issues
        SET readable_id = CASE rs.type
                WHEN 'STORY'   THEN 'US-'
                WHEN 'FEATURE' THEN 'FEAT-'
                ELSE                 'BUG-'
            END || LPAD(rs.rn::TEXT, 3, '0')
        FROM ranked_standalone rs
        WHERE issues.id = rs.id;
    END IF;

    -- ── Sync workspace_id_counters for tasks ─────────────────────────────────
    -- Filter NULL workspace_id: boards created before the workspace feature are skipped.
    INSERT INTO workspace_id_counters (workspace_id, item_type, last_counter)
    SELECT b.workspace_id, t.type, COUNT(*)::INT
    FROM tasks  t
    JOIN columns c ON c.id = t.column_id
    JOIN boards  b ON b.id = c.board_id
    WHERE b.workspace_id IS NOT NULL
    GROUP BY b.workspace_id, t.type
    ON CONFLICT (workspace_id, item_type)
        DO UPDATE SET last_counter = GREATEST(workspace_id_counters.last_counter, EXCLUDED.last_counter);

    -- ── Sync workspace_id_counters for issues (parent-linked) ────────────────
    INSERT INTO workspace_id_counters (workspace_id, item_type, last_counter)
    SELECT b.workspace_id, i.type, COUNT(*)::INT
    FROM issues  i
    JOIN tasks   pc ON pc.id = i.parent_card_id
    JOIN columns c  ON c.id  = pc.column_id
    JOIN boards  b  ON b.id  = c.board_id
    WHERE b.workspace_id IS NOT NULL
    GROUP BY b.workspace_id, i.type
    ON CONFLICT (workspace_id, item_type)
        DO UPDATE SET last_counter = GREATEST(workspace_id_counters.last_counter, EXCLUDED.last_counter);

    -- ── Sync counters for standalone issues (uses fallback workspace) ─────────
    IF fallback_ws IS NOT NULL THEN
        INSERT INTO workspace_id_counters (workspace_id, item_type, last_counter)
        SELECT fallback_ws, i.type, COUNT(*)::INT
        FROM issues i
        WHERE i.parent_card_id IS NULL
        GROUP BY i.type
        ON CONFLICT (workspace_id, item_type)
            DO UPDATE SET last_counter = GREATEST(workspace_id_counters.last_counter, EXCLUDED.last_counter);
    END IF;
END $$;
