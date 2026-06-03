package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1401: V24 modules + card_modules migration file assertions. No DB connection. */
class V24MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V24__create_modules_and_card_modules.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V24__create_modules_and_card_modules__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void creates_modules_table_with_board_id_fk() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATE TABLE").contains("MODULES");
        assertThat(sql).contains("BOARD_ID");
    }

    @Test void creates_card_modules_join_table() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CARD_MODULES");
        assertThat(sql).contains("CARD_ID").contains("MODULE_ID");
    }

    @Test void creates_indexes() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATE INDEX");
    }

    @Test void undo_drops_both_tables() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("CARD_MODULES");
        assertThat(sql).contains("MODULES");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V24__");
    }
}
