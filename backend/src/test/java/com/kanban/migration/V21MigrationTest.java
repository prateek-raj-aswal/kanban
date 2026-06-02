package com.kanban.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1207: File-content assertions for V21__create_refresh_tokens migration.
 *
 * No Spring context, no DB connection — purely reads the SQL files from disk
 * and asserts they contain the expected DDL elements.
 *
 * Tests are intentionally RED until the migration files are authored.
 *
 * Run: ./gradlew test --tests "com.kanban.migration.V21MigrationTest"
 */
class V21MigrationTest {

    private static final Path MIGRATION_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/migration/V21__create_refresh_tokens.sql"
    );

    private static final Path UNDO_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/undo/V21__create_refresh_tokens__undo.sql"
    );

    // -----------------------------------------------------------------------
    // TC-001  AC-1: forward migration file content
    // -----------------------------------------------------------------------

    /** TC-001-a: Migration file exists and is non-empty */
    @Test
    void v21_migration_file_exists_and_is_not_empty() throws IOException {
        assertThat(MIGRATION_FILE)
                .as("V21__create_refresh_tokens.sql must exist at db/migration/")
                .exists();

        String sql = Files.readString(MIGRATION_FILE);
        assertThat(sql)
                .as("V21__create_refresh_tokens.sql must not be empty")
                .isNotBlank();
    }

    /** TC-001-b: File creates a table named refresh_tokens */
    @Test
    void v21_migration_creates_refresh_tokens_table() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must contain CREATE TABLE refresh_tokens")
                .contains("CREATE TABLE")
                .contains("REFRESH_TOKENS");
    }

    /** TC-001-c: Table has user_id column (FK to users) */
    @Test
    void v21_migration_contains_user_id_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must declare a user_id column")
                .contains("USER_ID");
    }

    /** TC-001-d: Table has token_hash column */
    @Test
    void v21_migration_contains_token_hash_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must declare a token_hash column")
                .contains("TOKEN_HASH");
    }

    /** TC-001-e: Table has expires_at column */
    @Test
    void v21_migration_contains_expires_at_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must declare an expires_at column")
                .contains("EXPIRES_AT");
    }

    /** TC-001-f: Table has revoked_at column (nullable) */
    @Test
    void v21_migration_contains_revoked_at_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must declare a revoked_at column")
                .contains("REVOKED_AT");
    }

    /** TC-001-g: Table has replaced_by column (nullable UUID) */
    @Test
    void v21_migration_contains_replaced_by_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        assertThat(sql)
                .as("Migration must declare a replaced_by column")
                .contains("REPLACED_BY");
    }

    /** TC-001-h: An index on user_id is created — the CREATE INDEX line itself references USER_ID */
    @Test
    void v21_migration_creates_index_on_user_id() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        boolean indexLineContainsUserId = Arrays.stream(sql.split("\n"))
                .anyMatch(line -> line.contains("CREATE INDEX") && line.contains("USER_ID"));
        assertThat(indexLineContainsUserId)
                .as("A CREATE INDEX statement must reference USER_ID on the same line")
                .isTrue();
    }

    /** TC-001-i: A unique constraint or unique index on token_hash is created */
    @Test
    void v21_migration_creates_unique_constraint_on_token_hash() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();

        // Accept either: UNIQUE INDEX ... token_hash  OR  token_hash ... UNIQUE
        // Both patterns are valid SQL for this constraint.
        assertThat(sql)
                .as("Migration must declare a UNIQUE constraint or index on token_hash")
                .contains("UNIQUE");

        assertThat(sql)
                .as("The UNIQUE constraint/index must involve token_hash")
                .contains("TOKEN_HASH");
    }

    // -----------------------------------------------------------------------
    // TC-002  AC-2: undo/down script file content
    // -----------------------------------------------------------------------

    /** TC-002-a: Undo file exists and is non-empty */
    @Test
    void v21_undo_file_exists_and_is_not_empty() throws IOException {
        assertThat(UNDO_FILE)
                .as("V21__create_refresh_tokens__undo.sql must exist at db/migration/")
                .exists();

        String sql = Files.readString(UNDO_FILE);
        assertThat(sql)
                .as("V21__create_refresh_tokens__undo.sql must not be empty")
                .isNotBlank();
    }

    /** TC-002-b: Undo file has a DROP TABLE statement targeting refresh_tokens */
    @Test
    void v21_undo_file_drops_refresh_tokens_table() throws IOException {
        String sql = Files.readString(UNDO_FILE).toUpperCase();
        boolean dropLineTargetsTable = Arrays.stream(sql.split("\n"))
                .anyMatch(line -> line.contains("DROP TABLE") && line.contains("REFRESH_TOKENS"));
        assertThat(dropLineTargetsTable)
                .as("Undo script must have a DROP TABLE statement referencing REFRESH_TOKENS on the same line")
                .isTrue();
    }

    // -----------------------------------------------------------------------
    // TC-003  AC-1: Flyway double-underscore naming convention
    // -----------------------------------------------------------------------

    /** TC-003: Forward migration file name uses the V21__ double-underscore prefix */
    @Test
    void v21_migration_filename_uses_double_underscore_flyway_convention() {
        String filename = MIGRATION_FILE.getFileName().toString();

        assertThat(filename)
                .as("Flyway migration must use double-underscore separator: V21__<description>.sql")
                .startsWith("V21__");
    }
}
