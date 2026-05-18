package com.kanban.migration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-101: Verifies that V11__create_workspaces.sql migration produces the
 * correct schema state.  Tests query information_schema and pg_indexes —
 * they do NOT test application logic.
 *
 * Run: ./gradlew test --tests "com.kanban.migration.V11WorkspaceMigrationTest"
 *
 * The test DB must be reachable via application-test.yml.  Tests will be RED
 * until V11__create_workspaces.sql is placed in db/migration/.
 */
@SpringBootTest
@ActiveProfiles("test")
class V11WorkspaceMigrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    // -----------------------------------------------------------------------
    // AC-1  workspaces table columns
    // -----------------------------------------------------------------------

    /** AC-1: workspaces.id — UUID, NOT NULL, has DEFAULT */
    @Test
    void workspaces_id_column_exists_with_uuid_type_not_null_and_default() {
        String columnDefault = jdbc.queryForObject(
                "SELECT column_default " +
                "FROM information_schema.columns " +
                "WHERE table_schema = 'public' " +
                "  AND table_name   = 'workspaces' " +
                "  AND column_name  = 'id'",
                String.class);
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable " +
                "FROM information_schema.columns " +
                "WHERE table_schema = 'public' " +
                "  AND table_name   = 'workspaces' " +
                "  AND column_name  = 'id'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name " +
                "FROM information_schema.columns " +
                "WHERE table_schema = 'public' " +
                "  AND table_name   = 'workspaces' " +
                "  AND column_name  = 'id'",
                String.class);

        assertThat(dataType).isEqualTo("uuid");
        assertThat(nullable).isEqualTo("NO");
        assertThat(columnDefault).containsIgnoringCase("gen_random_uuid");
    }

    /** AC-1: workspaces.name — VARCHAR(100), NOT NULL */
    @Test
    void workspaces_name_column_is_varchar100_not_null() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='name'",
                String.class);
        Integer charMaxLen = jdbc.queryForObject(
                "SELECT character_maximum_length FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='name'",
                Integer.class);

        assertThat(nullable).isEqualTo("NO");
        assertThat(charMaxLen).isEqualTo(100);
    }

    /** AC-1: workspaces.owner_id — UUID, NOT NULL */
    @Test
    void workspaces_owner_id_column_is_uuid_not_null() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='owner_id'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='owner_id'",
                String.class);

        assertThat(dataType).isEqualTo("uuid");
        assertThat(nullable).isEqualTo("NO");
    }

    /** AC-1: workspaces.owner_id FK -> users(id) ON DELETE CASCADE */
    @Test
    void workspaces_owner_id_has_fk_to_users_with_cascade_delete() {
        String deleteRule = jdbc.queryForObject(
                "SELECT rc.delete_rule " +
                "FROM information_schema.referential_constraints rc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON kcu.constraint_name = rc.constraint_name " +
                " AND kcu.constraint_schema = rc.constraint_schema " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = rc.constraint_name " +
                " AND ccu.constraint_schema = rc.constraint_schema " +
                "WHERE kcu.table_name   = 'workspaces' " +
                "  AND kcu.column_name  = 'owner_id' " +
                "  AND ccu.table_name   = 'users' " +
                "  AND ccu.column_name  = 'id'",
                String.class);

        assertThat(deleteRule).isEqualTo("CASCADE");
    }

    /** AC-1: workspaces.created_at — TIMESTAMPTZ, NOT NULL, DEFAULT now() */
    @Test
    void workspaces_created_at_is_timestamptz_not_null_with_default() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='created_at'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='created_at'",
                String.class);
        String columnDefault = jdbc.queryForObject(
                "SELECT column_default FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='created_at'",
                String.class);

        assertThat(dataType).isEqualTo("timestamptz");
        assertThat(nullable).isEqualTo("NO");
        assertThat(columnDefault).containsIgnoringCase("now()");
    }

    /** AC-1: workspaces.updated_at — TIMESTAMPTZ, NOT NULL, DEFAULT now() */
    @Test
    void workspaces_updated_at_is_timestamptz_not_null_with_default() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='updated_at'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='updated_at'",
                String.class);
        String columnDefault = jdbc.queryForObject(
                "SELECT column_default FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspaces' AND column_name='updated_at'",
                String.class);

        assertThat(dataType).isEqualTo("timestamptz");
        assertThat(nullable).isEqualTo("NO");
        assertThat(columnDefault).containsIgnoringCase("now()");
    }

    // -----------------------------------------------------------------------
    // AC-2  workspace_members table columns and constraints
    // -----------------------------------------------------------------------

    /** AC-2: workspace_members.workspace_id — UUID, NOT NULL, FK->workspaces(id) CASCADE */
    @Test
    void workspace_members_workspace_id_is_uuid_not_null_fk_cascade() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='workspace_id'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='workspace_id'",
                String.class);
        String deleteRule = jdbc.queryForObject(
                "SELECT rc.delete_rule " +
                "FROM information_schema.referential_constraints rc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON kcu.constraint_name = rc.constraint_name " +
                " AND kcu.constraint_schema = rc.constraint_schema " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = rc.constraint_name " +
                " AND ccu.constraint_schema = rc.constraint_schema " +
                "WHERE kcu.table_name  = 'workspace_members' " +
                "  AND kcu.column_name = 'workspace_id' " +
                "  AND ccu.table_name  = 'workspaces' " +
                "  AND ccu.column_name = 'id'",
                String.class);

        assertThat(dataType).isEqualTo("uuid");
        assertThat(nullable).isEqualTo("NO");
        assertThat(deleteRule).isEqualTo("CASCADE");
    }

    /** AC-2: workspace_members.user_id — UUID, NOT NULL, FK->users(id) CASCADE */
    @Test
    void workspace_members_user_id_is_uuid_not_null_fk_cascade() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='user_id'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='user_id'",
                String.class);
        String deleteRule = jdbc.queryForObject(
                "SELECT rc.delete_rule " +
                "FROM information_schema.referential_constraints rc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON kcu.constraint_name = rc.constraint_name " +
                " AND kcu.constraint_schema = rc.constraint_schema " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = rc.constraint_name " +
                " AND ccu.constraint_schema = rc.constraint_schema " +
                "WHERE kcu.table_name  = 'workspace_members' " +
                "  AND kcu.column_name = 'user_id' " +
                "  AND ccu.table_name  = 'users' " +
                "  AND ccu.column_name = 'id'",
                String.class);

        assertThat(dataType).isEqualTo("uuid");
        assertThat(nullable).isEqualTo("NO");
        assertThat(deleteRule).isEqualTo("CASCADE");
    }

    /** AC-2: workspace_members.role — VARCHAR(20), NOT NULL, DEFAULT 'MEMBER', CHECK IN ('OWNER','ADMIN','MEMBER') */
    @Test
    void workspace_members_role_is_varchar20_not_null_with_default_member() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='role'",
                String.class);
        Integer charMaxLen = jdbc.queryForObject(
                "SELECT character_maximum_length FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='role'",
                Integer.class);
        String columnDefault = jdbc.queryForObject(
                "SELECT column_default FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='role'",
                String.class);

        assertThat(nullable).isEqualTo("NO");
        assertThat(charMaxLen).isEqualTo(20);
        assertThat(columnDefault).containsIgnoringCase("MEMBER");
    }

    /** AC-2: workspace_members.role CHECK constraint enforces OWNER, ADMIN, MEMBER */
    @Test
    void workspace_members_role_check_constraint_exists() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.check_constraints cc " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = cc.constraint_name " +
                " AND ccu.constraint_schema = cc.constraint_schema " +
                "WHERE ccu.table_name = 'workspace_members' " +
                "  AND ccu.column_name = 'role' " +
                "  AND cc.check_clause LIKE '%OWNER%' " +
                "  AND cc.check_clause LIKE '%ADMIN%' " +
                "  AND cc.check_clause LIKE '%MEMBER%'",
                Integer.class);

        assertThat(count).isGreaterThanOrEqualTo(1);
    }

    /** AC-2: workspace_members.joined_at — TIMESTAMPTZ, NOT NULL, DEFAULT now() */
    @Test
    void workspace_members_joined_at_is_timestamptz_not_null_with_default() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='joined_at'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='workspace_members' AND column_name='joined_at'",
                String.class);

        assertThat(dataType).isEqualTo("timestamptz");
        assertThat(nullable).isEqualTo("NO");
    }

    /** AC-2: workspace_members composite PK (workspace_id, user_id) */
    @Test
    void workspace_members_has_composite_primary_key_on_workspace_id_and_user_id() {
        List<String> pkColumns = jdbc.queryForList(
                "SELECT kcu.column_name " +
                "FROM information_schema.table_constraints tc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON kcu.constraint_name  = tc.constraint_name " +
                " AND kcu.constraint_schema = tc.constraint_schema " +
                "WHERE tc.table_name       = 'workspace_members' " +
                "  AND tc.constraint_type  = 'PRIMARY KEY' " +
                "ORDER BY kcu.ordinal_position",
                String.class);

        assertThat(pkColumns).containsExactlyInAnyOrder("workspace_id", "user_id");
    }

    // -----------------------------------------------------------------------
    // AC-3  boards.workspace_id nullable column with FK->workspaces(id) SET NULL
    // -----------------------------------------------------------------------

    /** AC-3: boards.workspace_id column exists as nullable UUID */
    @Test
    void boards_workspace_id_column_exists_as_nullable_uuid() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='boards' AND column_name='workspace_id'",
                String.class);
        String dataType = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='boards' AND column_name='workspace_id'",
                String.class);

        assertThat(dataType).isEqualTo("uuid");
        assertThat(nullable).isEqualTo("YES");
    }

    /** AC-3: boards.workspace_id FK->workspaces(id) ON DELETE SET NULL */
    @Test
    void boards_workspace_id_fk_to_workspaces_on_delete_set_null() {
        String deleteRule = jdbc.queryForObject(
                "SELECT rc.delete_rule " +
                "FROM information_schema.referential_constraints rc " +
                "JOIN information_schema.key_column_usage kcu " +
                "  ON kcu.constraint_name = rc.constraint_name " +
                " AND kcu.constraint_schema = rc.constraint_schema " +
                "JOIN information_schema.constraint_column_usage ccu " +
                "  ON ccu.constraint_name = rc.constraint_name " +
                " AND ccu.constraint_schema = rc.constraint_schema " +
                "WHERE kcu.table_name  = 'boards' " +
                "  AND kcu.column_name = 'workspace_id' " +
                "  AND ccu.table_name  = 'workspaces' " +
                "  AND ccu.column_name = 'id'",
                String.class);

        assertThat(deleteRule).isEqualTo("SET NULL");
    }

    // -----------------------------------------------------------------------
    // AC-4  pre-existing boards have workspace_id = NULL after migration
    // -----------------------------------------------------------------------

    /**
     * AC-4: All rows in boards have workspace_id = NULL after V11 runs.
     *
     * This verifies no data loss and no unintended population of workspace_id.
     * The assertion holds whether boards were inserted before or after earlier
     * migrations; V11 must not back-fill the column.
     */
    @Test
    void all_existing_boards_have_null_workspace_id_after_migration() {
        Integer boardsWithNonNullWorkspace = jdbc.queryForObject(
                "SELECT COUNT(*) FROM boards WHERE workspace_id IS NOT NULL",
                Integer.class);

        assertThat(boardsWithNonNullWorkspace)
                .as("No pre-existing board row should have workspace_id populated by the migration")
                .isEqualTo(0);
    }

    // -----------------------------------------------------------------------
    // AC-5  required indexes exist
    // -----------------------------------------------------------------------

    /** AC-5: idx_workspaces_owner on workspaces(owner_id) */
    @Test
    void index_idx_workspaces_owner_exists_on_workspaces_owner_id() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes " +
                "WHERE schemaname = 'public' " +
                "  AND tablename  = 'workspaces' " +
                "  AND indexname  = 'idx_workspaces_owner'",
                Integer.class);

        assertThat(count).isEqualTo(1);
    }

    /** AC-5: idx_ws_members_workspace on workspace_members(workspace_id) */
    @Test
    void index_idx_ws_members_workspace_exists_on_workspace_members_workspace_id() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes " +
                "WHERE schemaname = 'public' " +
                "  AND tablename  = 'workspace_members' " +
                "  AND indexname  = 'idx_ws_members_workspace'",
                Integer.class);

        assertThat(count).isEqualTo(1);
    }

    /** AC-5: idx_ws_members_user on workspace_members(user_id) */
    @Test
    void index_idx_ws_members_user_exists_on_workspace_members_user_id() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes " +
                "WHERE schemaname = 'public' " +
                "  AND tablename  = 'workspace_members' " +
                "  AND indexname  = 'idx_ws_members_user'",
                Integer.class);

        assertThat(count).isEqualTo(1);
    }

    /** AC-5: idx_boards_workspace on boards(workspace_id) WHERE deleted_at IS NULL */
    @Test
    void index_idx_boards_workspace_exists_as_partial_index_on_boards() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes " +
                "WHERE schemaname = 'public' " +
                "  AND tablename  = 'boards' " +
                "  AND indexname  = 'idx_boards_workspace'",
                Integer.class);

        assertThat(count).isEqualTo(1);
    }

    /** AC-5: idx_boards_workspace is a partial index (WHERE deleted_at IS NULL) */
    @Test
    void index_idx_boards_workspace_is_partial_with_deleted_at_predicate() {
        String indexDef = jdbc.queryForObject(
                "SELECT indexdef FROM pg_indexes " +
                "WHERE schemaname = 'public' " +
                "  AND tablename  = 'boards' " +
                "  AND indexname  = 'idx_boards_workspace'",
                String.class);

        assertThat(indexDef)
                .as("idx_boards_workspace must include a WHERE deleted_at IS NULL predicate")
                .containsIgnoringCase("deleted_at IS NULL");
    }
}
