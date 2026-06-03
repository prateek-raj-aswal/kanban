package com.kanban.service;

import com.kanban.exception.ApiException;
import com.kanban.model.BoardMember;
import com.kanban.model.WorkspaceMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.BoardAction;
import com.kanban.security.Role;
import com.kanban.security.WorkspaceAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.when;

/**
 * US-1409 — Role x action matrix.
 *
 * TC-1  VIEWER  → BoardAction.WRITE → 403
 * TC-2  MEMBER  → BoardAction.WRITE → allowed
 * TC-3  ADMIN   → BoardAction.WRITE → allowed
 * TC-4  OWNER   → BoardAction.WRITE → allowed
 * TC-5  MEMBER  → WorkspaceAccessPolicy.assertAdminOrOwner → 403
 * TC-6  ADMIN   → WorkspaceAccessPolicy.assertAdminOrOwner → allowed
 * TC-7  OWNER   → WorkspaceAccessPolicy.assertAdminOrOwner → allowed
 */
@ExtendWith(MockitoExtension.class)
class RoleAuthorizationTest {

    @Mock BoardMemberRepository boardMemberRepository;
    @Mock WorkspaceMemberRepository workspaceMemberRepository;

    BoardAccessPolicy boardAccessPolicy;
    WorkspaceAccessPolicy workspaceAccessPolicy;

    UUID boardId;
    UUID workspaceId;
    UUID userId;

    @BeforeEach
    void setUp() {
        boardAccessPolicy = new BoardAccessPolicy(boardMemberRepository);
        workspaceAccessPolicy = new WorkspaceAccessPolicy(workspaceMemberRepository);
        boardId     = UUID.randomUUID();
        workspaceId = UUID.randomUUID();
        userId      = UUID.randomUUID();
    }

    // ── BoardAccessPolicy tests ───────────────────────────────────────────────

    @Test
    void tc1_viewer_cannotWrite() {
        when(boardMemberRepository.findByBoardIdAndUserId(boardId, userId))
                .thenReturn(Optional.of(boardMemberWithRole(Role.VIEWER)));

        assertThatThrownBy(() -> boardAccessPolicy.assertAccess(boardId, userId, BoardAction.WRITE))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
    }

    @Test
    void tc2_member_canWrite() {
        when(boardMemberRepository.findByBoardIdAndUserId(boardId, userId))
                .thenReturn(Optional.of(boardMemberWithRole(Role.MEMBER)));

        assertThatCode(() -> boardAccessPolicy.assertAccess(boardId, userId, BoardAction.WRITE))
                .doesNotThrowAnyException();
    }

    @Test
    void tc3_admin_canWrite() {
        when(boardMemberRepository.findByBoardIdAndUserId(boardId, userId))
                .thenReturn(Optional.of(boardMemberWithRole(Role.ADMIN)));

        assertThatCode(() -> boardAccessPolicy.assertAccess(boardId, userId, BoardAction.WRITE))
                .doesNotThrowAnyException();
    }

    @Test
    void tc4_owner_canWrite() {
        when(boardMemberRepository.findByBoardIdAndUserId(boardId, userId))
                .thenReturn(Optional.of(boardMemberWithRole(Role.OWNER)));

        assertThatCode(() -> boardAccessPolicy.assertAccess(boardId, userId, BoardAction.WRITE))
                .doesNotThrowAnyException();
    }

    // ── WorkspaceAccessPolicy tests ───────────────────────────────────────────

    @Test
    void tc5_member_cannotAdminOrOwner() {
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(workspaceMemberWithRole(Role.MEMBER)));

        assertThatThrownBy(() -> workspaceAccessPolicy.assertAdminOrOwner(workspaceId, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
    }

    @Test
    void tc6_admin_canAdminOrOwner() {
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(workspaceMemberWithRole(Role.ADMIN)));

        assertThatCode(() -> workspaceAccessPolicy.assertAdminOrOwner(workspaceId, userId))
                .doesNotThrowAnyException();
    }

    @Test
    void tc7_owner_canAdminOrOwner() {
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(workspaceMemberWithRole(Role.OWNER)));

        assertThatCode(() -> workspaceAccessPolicy.assertAdminOrOwner(workspaceId, userId))
                .doesNotThrowAnyException();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private BoardMember boardMemberWithRole(Role role) {
        BoardMember m = new BoardMember();
        m.setBoardId(boardId);
        m.setUserId(userId);
        m.setRole(role);
        return m;
    }

    private WorkspaceMember workspaceMemberWithRole(Role role) {
        WorkspaceMember m = new WorkspaceMember();
        setField(m, "workspaceId", workspaceId);
        setField(m, "userId", userId);
        m.setRole(role);
        setField(m, "joinedAt", Instant.now());
        return m;
    }

    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
