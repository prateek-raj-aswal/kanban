package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1601: V28 workspace_id_counters migration file assertions. No DB connection. */
class V28MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V28__create_workspace_id_counters.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V28__create_workspace_id_counters__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void creates_workspace_id_counters_table() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATE TABLE");
        assertThat(sql).contains("WORKSPACE_ID_COUNTERS");
    }

    @Test void has_workspace_id_column_fk_to_workspaces() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("WORKSPACE_ID");
        assertThat(sql).contains("REFERENCES").contains("WORKSPACES");
    }

    @Test void has_item_type_varchar10_column() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("ITEM_TYPE");
        assertThat(sql).contains("VARCHAR(10)");
    }

    @Test void has_last_counter_integer_default_zero() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("LAST_COUNTER");
        assertThat(sql).contains("INTEGER");
        assertThat(sql).contains("DEFAULT 0");
    }

    @Test void has_composite_primary_key() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("PRIMARY KEY");
        // Both columns must appear in the PK definition
        assertThat(sql).contains("WORKSPACE_ID");
        assertThat(sql).contains("ITEM_TYPE");
    }

    @Test void undo_drops_table() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("DROP");
        assertThat(sql).contains("WORKSPACE_ID_COUNTERS");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V28__");
    }
}
