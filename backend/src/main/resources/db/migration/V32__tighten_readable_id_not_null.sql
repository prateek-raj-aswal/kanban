-- US-1610: tighten readable_id to NOT NULL on tasks and issues.
-- V31 back-fills rows where boards have a workspace_id.
-- Any remaining NULLs (legacy boards with no workspace) get a LEGACY-NNN fallback here.

DO $$
DECLARE
    task_counter INT := 0;
    issue_counter INT := 0;
    r RECORD;
BEGIN
    -- Assign LEGACY-NNN to tasks that still have NULL readable_id
    FOR r IN
        SELECT id FROM tasks WHERE readable_id IS NULL ORDER BY created_at
    LOOP
        task_counter := task_counter + 1;
        UPDATE tasks SET readable_id = 'LEGACY-' || LPAD(task_counter::TEXT, 3, '0')
        WHERE id = r.id;
    END LOOP;

    -- Assign LEGACY-NNN to issues that still have NULL readable_id
    FOR r IN
        SELECT id FROM issues WHERE readable_id IS NULL ORDER BY created_at
    LOOP
        issue_counter := issue_counter + 1;
        UPDATE issues SET readable_id = 'LEGACY-' || LPAD(issue_counter::TEXT, 3, '0')
        WHERE id = r.id;
    END LOOP;
END $$;

ALTER TABLE tasks  ALTER COLUMN readable_id SET NOT NULL;
ALTER TABLE issues ALTER COLUMN readable_id SET NOT NULL;
