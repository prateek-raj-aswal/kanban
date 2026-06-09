package com.kanban.migration;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

/** US-1604: V31 back-fill readable_ids migration file assertions. No DB connection. */
class V31MigrationTest {

    private static final Path MIGRATION = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/migration/V31__backfill_readable_ids.sql");
    private static final Path UNDO = Path.of(System.getProperty("user.dir"),
            "src/main/resources/db/undo/V31__backfill_readable_ids__undo.sql");

    @Test void migration_file_exists() throws IOException {
        assertThat(MIGRATION).exists();
        assertThat(Files.readString(MIGRATION)).isNotBlank();
    }

    @Test void back_fills_tasks_readable_id() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("TASKS");
        assertThat(sql).contains("READABLE_ID");
    }

    @Test void back_fills_issues_readable_id() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("ISSUES");
        assertThat(sql).contains("READABLE_ID");
    }

    @Test void uses_ordering_by_created_at() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("CREATED_AT");
    }

    @Test void populates_workspace_id_counters() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        assertThat(sql).contains("WORKSPACE_ID_COUNTERS");
        assertThat(sql).contains("LAST_COUNTER");
    }

    @Test void uses_do_block_or_with_cte_for_set_based_logic() throws IOException {
        String sql = Files.readString(MIGRATION).toUpperCase();
        // expects a procedural DO block or CTE-based logic
        assertThat(sql).satisfiesAnyOf(
                s -> assertThat(s).contains("DO $$"),
                s -> assertThat(s).contains("DO\n$$"),
                s -> assertThat(s).contains("DO $"),
                s -> assertThat(s).contains("WITH ")
        );
    }

    @Test void undo_nulls_readable_id_on_tasks_and_issues() throws IOException {
        assertThat(UNDO).exists();
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("UPDATE");
        assertThat(sql).contains("READABLE_ID");
        assertThat(sql).contains("NULL");
    }

    @Test void undo_deletes_counter_rows() throws IOException {
        String sql = Files.readString(UNDO).toUpperCase();
        assertThat(sql).contains("DELETE").contains("WORKSPACE_ID_COUNTERS");
    }

    @Test void filename_convention() {
        assertThat(MIGRATION.getFileName().toString()).startsWith("V31__");
    }
}
