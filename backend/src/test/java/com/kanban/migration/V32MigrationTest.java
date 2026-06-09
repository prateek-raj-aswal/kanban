package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1610: V32 tightens readable_id to NOT NULL on tasks and issues. No DB connection. */
class V32MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V32__tighten_readable_id_not_null.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V32__tighten_readable_id_not_null__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void sets_readable_id_not_null_on_tasks() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("TASKS");
        assertThat(sql).contains("READABLE_ID");
        assertThat(sql).contains("NOT NULL");
    }

    @Test void sets_readable_id_not_null_on_issues() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("ISSUES");
        assertThat(sql).contains("READABLE_ID");
        assertThat(sql).contains("NOT NULL");
    }

    @Test void uses_alter_table_set_not_null() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("ALTER TABLE");
        assertThat(sql).contains("SET NOT NULL");
    }

    @Test void undo_file_exists() throws IOException {
        assertThat(UNDO).exists();
        assertThat(Files.readString(UNDO)).isNotBlank();
    }

    @Test void undo_drops_not_null_constraint_on_tasks() throws IOException {
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("TASKS");
        assertThat(sql).contains("DROP NOT NULL");
    }

    @Test void undo_drops_not_null_constraint_on_issues() throws IOException {
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("ISSUES");
        assertThat(sql).contains("DROP NOT NULL");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V32__");
    }
}
