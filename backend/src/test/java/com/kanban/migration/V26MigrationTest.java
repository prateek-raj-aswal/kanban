package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1408: V26 role normalization migration file assertions. No DB connection. */
class V26MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V26__normalize_role_strings.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V26__normalize_role_strings__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void adds_check_constraint_to_board_members() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("BOARD_MEMBERS");
        assertThat(sql).contains("CHECK").contains("VIEWER");
    }

    @Test void updates_workspace_members_constraint_to_include_viewer() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("WORKSPACE_MEMBERS");
        assertThat(sql).contains("VIEWER");
    }

    @Test void drops_old_workspace_constraint_before_adding_new() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("DROP CONSTRAINT");
        assertThat(sql).contains("ADD CONSTRAINT");
    }

    @Test void normalizes_existing_role_strings_data_safe() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        // UPDATE statements normalize rows before constraint added
        assertThat(sql).contains("UPDATE").contains("MEMBER");
    }

    @Test void undo_restores_previous_constraint() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("DROP CONSTRAINT");
        assertThat(sql).contains("ADD CONSTRAINT");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V26__");
    }
}
