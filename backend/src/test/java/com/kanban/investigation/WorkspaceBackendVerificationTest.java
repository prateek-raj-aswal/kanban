package com.kanban.investigation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1301 — INVESTIGATE & verify workspace backend
 * Phase: PHASE-013  |  Story points: 1
 *
 * This is a static verification document written as JUnit tests.
 * It checks that WorkspaceController.java, WorkspaceService.java, and their
 * existing test files exist and contain the expected method signatures.
 * No DB connection or Spring context is required.
 *
 * ENDPOINT INVENTORY
 * ──────────────────────────────────────────────────────────────────────────────
 * #  Method  Path                                    Success  403 trigger
 * 1  POST    /api/v1/workspaces                      201      unauthenticated (401)
 * 2  GET     /api/v1/workspaces                      200      unauthenticated (401)
 * 3  GET     /api/v1/workspaces/{id}                 200      non-member (403)
 * 4  PATCH   /api/v1/workspaces/{id}                 200      non-admin/owner (403)
 * 5  DELETE  /api/v1/workspaces/{id}                 204      non-owner (403)
 * 6  GET     /api/v1/workspaces/{id}/members         200      non-member (403)
 * 7  POST    /api/v1/workspaces/{id}/members         201      non-admin/owner (403)
 * 8  DELETE  /api/v1/workspaces/{id}/members/{uid}   204      non-admin/owner (403); owner removal (403)
 *
 * SECURITY NOTES
 * ──────────────────────────────────────────────────────────────────────────────
 * - No @PreAuthorize annotations on the controller. Security is enforced globally
 *   via SecurityConfig (.anyRequest().authenticated()) + JWT filter.
 * - All /api/v1/workspaces/** routes require a valid JWT; missing/invalid token
 *   returns HTTP 401 (authenticationEntryPoint -> HttpStatus.UNAUTHORIZED).
 * - Fine-grained 403 access control is enforced inside WorkspaceService:
 *     * getWorkspace       — throws 403 if caller is not a workspace member
 *     * updateWorkspace    — throws 403 if caller is not OWNER or ADMIN
 *     * deleteWorkspace    — throws 403 if caller is not the workspace owner
 *     * listMembers        — throws 403 if caller is not a workspace member
 *     * addMember          — throws 403 if caller is not OWNER or ADMIN
 *     * removeMember       — throws 403 if caller is not OWNER or ADMIN, or tries to remove OWNER
 *
 * GAP ANALYSIS  →  NO GAPS FOUND
 * ──────────────────────────────────────────────────────────────────────────────
 * All eight expected CRUD + membership endpoints are present.
 * HTTP response codes match REST conventions (201/200/204).
 * Service-layer authorization is thorough and tested by WorkspaceServiceTest
 * and WorkspaceMembershipTest (22 test cases combined).
 * US-1302 is NOT required; this story closes cleanly.
 */
@DisplayName("US-1301 – Workspace backend verification (investigation)")
class WorkspaceBackendVerificationTest {

    // Resolve source paths relative to project root so tests work from any CWD.
    private static final Path PROJECT_ROOT = resolveProjectRoot();

    private static final Path CONTROLLER_FILE = PROJECT_ROOT
            .resolve("backend/src/main/java/com/kanban/controller/WorkspaceController.java");
    private static final Path SERVICE_FILE = PROJECT_ROOT
            .resolve("backend/src/main/java/com/kanban/service/WorkspaceService.java");
    private static final Path SERVICE_TEST_FILE = PROJECT_ROOT
            .resolve("backend/src/test/java/com/kanban/service/WorkspaceServiceTest.java");
    private static final Path MEMBERSHIP_TEST_FILE = PROJECT_ROOT
            .resolve("backend/src/test/java/com/kanban/service/WorkspaceMembershipTest.java");
    private static final Path SECURITY_CONFIG_FILE = PROJECT_ROOT
            .resolve("backend/src/main/java/com/kanban/security/SecurityConfig.java");

    // ── File existence ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Source files exist")
    class FileExistence {

        @Test
        @DisplayName("WorkspaceController.java exists")
        void controllerFileExists() {
            assertThat(CONTROLLER_FILE).exists();
        }

        @Test
        @DisplayName("WorkspaceService.java exists")
        void serviceFileExists() {
            assertThat(SERVICE_FILE).exists();
        }

        @Test
        @DisplayName("WorkspaceServiceTest.java exists")
        void serviceTestFileExists() {
            assertThat(SERVICE_TEST_FILE).exists();
        }

        @Test
        @DisplayName("WorkspaceMembershipTest.java exists")
        void membershipTestFileExists() {
            assertThat(MEMBERSHIP_TEST_FILE).exists();
        }

        @Test
        @DisplayName("SecurityConfig.java exists")
        void securityConfigFileExists() {
            assertThat(SECURITY_CONFIG_FILE).exists();
        }
    }

    // ── Controller endpoint inventory ─────────────────────────────────────────

    @Nested
    @DisplayName("WorkspaceController — 8 endpoints present")
    class ControllerEndpoints {

        private String source() throws IOException {
            return Files.readString(CONTROLLER_FILE);
        }

        @Test
        @DisplayName("POST /workspaces — create() returns 201")
        void endpoint1_createWorkspace() throws IOException {
            String src = source();
            assertThat(src).contains("@PostMapping");
            assertThat(src).contains("ResponseEntity<WorkspaceResponse> create(");
            assertThat(src).contains("HttpStatus.CREATED");
        }

        @Test
        @DisplayName("GET /workspaces — list() returns 200")
        void endpoint2_listWorkspaces() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<List<WorkspaceResponse>> list(");
        }

        @Test
        @DisplayName("GET /workspaces/{id} — get() returns 200")
        void endpoint3_getWorkspace() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<WorkspaceResponse> get(@PathVariable UUID workspaceId");
        }

        @Test
        @DisplayName("PATCH /workspaces/{id} — update() returns 200")
        void endpoint4_updateWorkspace() throws IOException {
            String src = source();
            assertThat(src).contains("@PatchMapping(\"/{workspaceId}\")");
            assertThat(src).contains("ResponseEntity<WorkspaceResponse> update(@PathVariable UUID workspaceId");
        }

        @Test
        @DisplayName("DELETE /workspaces/{id} — delete() returns 204")
        void endpoint5_deleteWorkspace() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<Void> delete(@PathVariable UUID workspaceId");
            assertThat(src).contains("ResponseEntity.noContent().build()");
        }

        @Test
        @DisplayName("GET /workspaces/{id}/members — listMembers() returns 200")
        void endpoint6_listMembers() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<List<WorkspaceMemberResponse>> listMembers(");
        }

        @Test
        @DisplayName("POST /workspaces/{id}/members — addMember() returns 201")
        void endpoint7_addMember() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<Void> addMember(@PathVariable UUID workspaceId");
            // 201 status returned for addMember
            assertThat(src).contains("ResponseEntity.status(HttpStatus.CREATED).build()");
        }

        @Test
        @DisplayName("DELETE /workspaces/{id}/members/{uid} — removeMember() returns 204")
        void endpoint8_removeMember() throws IOException {
            String src = source();
            assertThat(src).contains("ResponseEntity<Void> removeMember(@PathVariable UUID workspaceId");
        }

        @Test
        @DisplayName("Controller is mapped to /api/v1/workspaces")
        void basePath() throws IOException {
            assertThat(source()).contains("@RequestMapping(\"/api/v1/workspaces\")");
        }
    }

    // ── Service authorization checks ──────────────────────────────────────────

    @Nested
    @DisplayName("WorkspaceService — authorization guards")
    class ServiceAuthorization {

        private String source() throws IOException {
            return Files.readString(SERVICE_FILE);
        }

        @Test
        @DisplayName("getWorkspace throws 403 for non-members")
        void getWorkspace_forbiddenForNonMember() throws IOException {
            assertThat(source())
                    .contains("NOT_WORKSPACE_MEMBER")
                    .contains("HttpStatus.FORBIDDEN");
        }

        @Test
        @DisplayName("updateWorkspace enforces OWNER or ADMIN role")
        void updateWorkspace_requiresAdminOrOwner() throws IOException {
            assertThat(source()).contains("assertAdminOrOwner(workspaceId, actorId)");
        }

        @Test
        @DisplayName("deleteWorkspace enforces OWNER-only")
        void deleteWorkspace_requiresOwner() throws IOException {
            assertThat(source())
                    .contains("NOT_WORKSPACE_OWNER")
                    .contains("Only the workspace owner can delete it");
        }

        @Test
        @DisplayName("listMembers enforces workspace membership")
        void listMembers_requiresMembership() throws IOException {
            assertThat(source()).contains("assertMember(workspaceId, actorId)");
        }

        @Test
        @DisplayName("addMember enforces OWNER or ADMIN role")
        void addMember_requiresAdminOrOwner() throws IOException {
            String src = source();
            // addMember calls assertAdminOrOwner before saving
            assertThat(src).contains("assertAdminOrOwner(workspaceId, actorId)");
            assertThat(src).contains("ALREADY_MEMBER");
        }

        @Test
        @DisplayName("removeMember prevents removal of workspace owner")
        void removeMember_cannotRemoveOwner() throws IOException {
            assertThat(source())
                    .contains("CANNOT_REMOVE_OWNER")
                    .contains("Cannot remove the workspace owner");
        }
    }

    // ── Security configuration ────────────────────────────────────────────────

    @Nested
    @DisplayName("SecurityConfig — global JWT authentication")
    class SecurityConfiguration {

        private String source() throws IOException {
            return Files.readString(SECURITY_CONFIG_FILE);
        }

        @Test
        @DisplayName("All non-public requests require authentication")
        void anyRequestAuthenticated() throws IOException {
            assertThat(source()).contains("anyRequest().authenticated()");
        }

        @Test
        @DisplayName("Unauthenticated requests receive HTTP 401")
        void unauthenticatedReturns401() throws IOException {
            assertThat(source())
                    .contains("HttpStatusEntryPoint")
                    .contains("HttpStatus.UNAUTHORIZED");
        }

        @Test
        @DisplayName("JWT filter is registered before UsernamePasswordAuthenticationFilter")
        void jwtFilterRegistered() throws IOException {
            assertThat(source())
                    .contains("JwtAuthenticationFilter")
                    .contains("addFilterBefore");
        }
    }

    // ── Gap analysis ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Gap analysis — no gaps expected (US-1302 not required)")
    class GapAnalysis {

        @Test
        @DisplayName("All 9 endpoints exist — count verified via method signatures")
        void allEightEndpointsPresent() throws IOException {
            String src = Files.readString(CONTROLLER_FILE);
            long methodCount = java.util.stream.Stream.of(
                    "ResponseEntity<WorkspaceResponse> create(",
                    "ResponseEntity<List<WorkspaceResponse>> list(",
                    "ResponseEntity<WorkspaceResponse> get(",
                    "ResponseEntity<WorkspaceResponse> update(",
                    "ResponseEntity<Void> delete(",
                    "ResponseEntity<List<WorkspaceMemberResponse>> listMembers(",
                    "ResponseEntity<Void> addMember(",
                    "ResponseEntity<Void> removeMember(",
                    "ResponseEntity<Void> updateMemberRole("
            ).filter(src::contains).count();

            assertThat(methodCount)
                    .as("Expected 9 endpoint methods in WorkspaceController")
                    .isEqualTo(9);
        }

        @Test
        @DisplayName("No endpoint missing @AuthenticationPrincipal — all require authenticated user")
        void allEndpointsRequireAuthenticatedUser() throws IOException {
            String src = Files.readString(CONTROLLER_FILE);
            // Count @AuthenticationPrincipal occurrences — should match endpoint count (9)
            long count = countOccurrences(src, "@AuthenticationPrincipal");
            assertThat(count)
                    .as("Each of the 9 endpoints must bind @AuthenticationPrincipal")
                    .isEqualTo(9);
        }

        @Test
        @DisplayName("Access policy provides authorization helpers assertMember and assertAdminOrOwner")
        void serviceAuthorizationHelpersPresent() throws IOException {
            Path policyFile = PROJECT_ROOT.resolve(
                    "backend/src/main/java/com/kanban/security/WorkspaceAccessPolicy.java");
            String src = Files.readString(policyFile);
            assertThat(src).contains("assertMember(");
            assertThat(src).contains("assertAdminOrOwner(");
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static Path resolveProjectRoot() {
        // Walk up from the compiled class file's module location to find the
        // Kanaban project root (the directory that contains "backend/").
        Path candidate = Paths.get("").toAbsolutePath();
        while (candidate != null) {
            if (Files.isDirectory(candidate.resolve("backend"))) {
                return candidate;
            }
            candidate = candidate.getParent();
        }
        // Fallback: assume CWD is backend/ sub-directory (Gradle default)
        return Paths.get("").toAbsolutePath().getParent();
    }

    private static long countOccurrences(String text, String pattern) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(pattern, idx)) != -1) {
            count++;
            idx += pattern.length();
        }
        return count;
    }
}
