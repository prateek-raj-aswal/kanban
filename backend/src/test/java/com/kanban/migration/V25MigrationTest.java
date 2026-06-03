package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1405: V25 issues table migration file assertions. No DB connection. */
class V25MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V25__create_issues.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V25__create_issues__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void creates_issues_table() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATE TABLE").contains("ISSUES");
    }

    @Test void has_nullable_parent_card_id() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("PARENT_CARD_ID");
        // nullable — must NOT have NOT NULL next to parent_card_id
        int idx = sql.indexOf("PARENT_CARD_ID");
        String vicinity = sql.substring(idx, Math.min(idx + 80, sql.length()));
        assertThat(vicinity).doesNotContain("NOT NULL");
    }

    @Test void has_index_on_parent_card_id() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATE INDEX");
        assertThat(sql).contains("PARENT_CARD");
    }

    @Test void standalone_issue_no_parent_required() throws IOException {
        // verified by nullable parent_card_id — no NOT NULL on that column
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("PARENT_CARD_ID");
    }

    @Test void undo_drops_issues() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("DROP").contains("ISSUES");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V25__");
    }
}
