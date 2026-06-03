package com.kanban.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1306: File-content assertions for V22__add_description_to_boards migration.
 * No Spring context, no DB connection — reads SQL from disk.
 */
class V22MigrationTest {

    private static final Path MIGRATION_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/migration/V22__add_description_to_boards.sql"
    );

    private static final Path UNDO_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/undo/V22__add_description_to_boards__undo.sql"
    );

    @Test
    void v22_migration_file_exists_and_is_not_empty() throws IOException {
        assertThat(MIGRATION_FILE).exists();
        assertThat(Files.readString(MIGRATION_FILE)).isNotBlank();
    }

    @Test
    void v22_migration_adds_description_column_to_boards() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        assertThat(sql).contains("ALTER TABLE").contains("BOARDS");
        assertThat(sql).contains("DESCRIPTION");
    }

    @Test
    void v22_migration_description_is_nullable() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        // description must NOT have NOT NULL constraint (it's nullable)
        assertThat(sql).doesNotContain("NOT NULL");
    }

    @Test
    void v22_undo_file_exists_and_drops_description() throws IOException {
        assertThat(UNDO_FILE).exists();
        String sql = Files.readString(UNDO_FILE).toUpperCase();
        assertThat(sql).contains("DROP COLUMN").contains("DESCRIPTION");
    }

    @Test
    void v22_filename_uses_double_underscore_convention() {
        assertThat(MIGRATION_FILE.getFileName().toString()).startsWith("V22__");
    }
}
