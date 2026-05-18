package com.kanban.migration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-201, US-202: Verifies V12__card_assignees_and_start_date.sql schema state.
 * Requires live DB via application-test.yml.
 * Run: ./gradlew test --tests "com.kanban.migration.V12CardAssigneeMigrationTest"
 */
@SpringBootTest
@ActiveProfiles("test")
class V12CardAssigneeMigrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    // ── card_assignees table ──────────────────────────────────────────────────

    @Test
    void cardAssignees_card_id_is_uuid_not_null() {
        String result = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='card_assignees' AND column_name='card_id'",
                String.class);
        assertThat(result).isEqualTo("uuid");
    }

    @Test
    void cardAssignees_user_id_is_uuid_not_null() {
        String result = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='card_assignees' AND column_name='user_id'",
                String.class);
        assertThat(result).isEqualTo("uuid");
    }

    @Test
    void cardAssignees_assigned_at_is_timestamptz_not_null() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='card_assignees' AND column_name='assigned_at'",
                String.class);
        assertThat(nullable).isEqualTo("NO");
    }

    @Test
    void cardAssignees_primary_key_covers_card_and_user() {
        int count = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.table_constraints tc " +
                "JOIN information_schema.constraint_column_usage ccu USING (constraint_name, table_schema) " +
                "WHERE tc.table_schema='public' AND tc.table_name='card_assignees' " +
                "  AND tc.constraint_type='PRIMARY KEY' " +
                "  AND ccu.column_name IN ('card_id','user_id')",
                Integer.class);
        assertThat(count).isEqualTo(2);
    }

    @Test
    void cardAssignees_index_on_card_id_exists() {
        boolean exists = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM pg_indexes " +
                "WHERE schemaname='public' AND tablename='card_assignees' " +
                "  AND indexname='idx_card_assignees_card')",
                Boolean.class));
        assertThat(exists).isTrue();
    }

    @Test
    void cardAssignees_index_on_user_id_exists() {
        boolean exists = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM pg_indexes " +
                "WHERE schemaname='public' AND tablename='card_assignees' " +
                "  AND indexname='idx_card_assignees_user')",
                Boolean.class));
        assertThat(exists).isTrue();
    }

    // ── cards.start_date ──────────────────────────────────────────────────────

    @Test
    void cards_start_date_column_exists_and_is_date_type() {
        String result = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='cards' AND column_name='start_date'",
                String.class);
        assertThat(result).isEqualTo("date");
    }

    @Test
    void cards_start_date_is_nullable() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='cards' AND column_name='start_date'",
                String.class);
        assertThat(nullable).isEqualTo("YES");
    }

    // ── assignee_id dropped ───────────────────────────────────────────────────

    @Test
    void cards_assignee_id_column_does_not_exist() {
        int count = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='cards' AND column_name='assignee_id'",
                Integer.class);
        assertThat(count).isEqualTo(0);
    }
}
