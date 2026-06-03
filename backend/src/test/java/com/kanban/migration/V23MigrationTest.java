package com.kanban.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1311: File-content assertions for V23__add_color_to_cards migration.
 * No Spring context, no DB connection — reads SQL from disk.
 */
class V23MigrationTest {

    private static final Path MIGRATION_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/migration/V23__add_color_to_cards.sql"
    );

    private static final Path UNDO_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/undo/V23__add_color_to_cards__undo.sql"
    );

    @Test
    void v23_migration_file_exists_and_is_not_empty() throws IOException {
        assertThat(MIGRATION_FILE).exists();
        assertThat(Files.readString(MIGRATION_FILE)).isNotBlank();
    }

    @Test
    void v23_migration_adds_color_column_to_tasks() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        assertThat(sql).contains("ALTER TABLE").contains("TASKS");
        assertThat(sql).contains("COLOR");
    }

    @Test
    void v23_migration_color_is_nullable() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        assertThat(sql).doesNotContain("NOT NULL");
    }

    @Test
    void v23_undo_file_exists_and_drops_color() throws IOException {
        assertThat(UNDO_FILE).exists();
        String sql = Files.readString(UNDO_FILE).toUpperCase();
        assertThat(sql).contains("DROP COLUMN").contains("COLOR");
    }

    @Test
    void v23_filename_uses_double_underscore_convention() {
        assertThat(MIGRATION_FILE.getFileName().toString()).startsWith("V23__");
    }
}
