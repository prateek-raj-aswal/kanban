package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1602: V29 type + readable_id columns on tasks. No DB connection. */
class V29MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V29__add_type_readable_id_to_tasks.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V29__add_type_readable_id_to_tasks__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void adds_type_column_with_not_null_default_story() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("TYPE");
        assertThat(sql).contains("VARCHAR(10)");
        assertThat(sql).contains("NOT NULL");
        assertThat(sql).contains("DEFAULT 'STORY'");
    }

    @Test void type_check_constraint_includes_all_three_values() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CHECK");
        assertThat(sql).contains("'STORY'");
        assertThat(sql).contains("'FEATURE'");
        assertThat(sql).contains("'BUG'");
    }

    @Test void adds_readable_id_column_nullable() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("READABLE_ID");
        assertThat(sql).contains("VARCHAR(20)");
        // must be nullable — no NOT NULL on readable_id line
        int idx = sql.indexOf("READABLE_ID");
        String vicinity = sql.substring(idx, Math.min(idx + 80, sql.length()));
        assertThat(vicinity).doesNotContain("NOT NULL");
    }

    @Test void targets_tasks_table() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("TASKS");
    }

    @Test void undo_drops_both_columns() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("DROP COLUMN");
        assertThat(sql).contains("TYPE");
        assertThat(sql).contains("READABLE_ID");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V29__");
    }
}
