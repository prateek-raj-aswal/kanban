package com.kanban.service;

import com.kanban.exception.ApiException;
import com.kanban.model.BoardMember;
import com.kanban.model.WorkspaceMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.Role;
import com.kanban.security.WorkspaceAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleAssignmentTest {

    @Mock WorkspaceMemberRepository workspaceMemberRepo;
    @Mock BoardMemberRepository boardMemberRepo;

    // Real policy objects backed by mocked repositories
    WorkspaceAccessPolicy workspacePolicy;
    BoardAccessPolicy boardPolicy;

    WorkspaceService workspaceService;
    BoardService boardService;

    private UUID workspaceId;
    private UUID boardId;
    private UUID ownerId;
    private UUID adminId;
    private UUID memberId;
    private UUID targetId;

    @Mock com.kanban.repository.WorkspaceRepository workspaceRepository;
    @Mock com.kanban.repository.UserRepository userRepository;
    @Mock com.kanban.repository.BoardRepository boardRepository;
    @Mock com.kanban.repository.SubtaskRepository subtaskRepository;
    @Mock com.kanban.repository.CommentRepository commentRepository;
    @Mock com.kanban.repository.CardAssigneeRepository cardAssigneeRepository;
    @Mock com.kanban.repository.CardModuleRepository cardModuleRepository;
    @Mock com.kanban.repository.CardRepository cardRepository;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        boardId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        adminId = UUID.randomUUID();
        memberId = UUID.randomUUID();
        targetId = UUID.randomUUID();

        workspacePolicy = new WorkspaceAccessPolicy(workspaceMemberRepo);
        boardPolicy = new BoardAccessPolicy(boardMemberRepo);

        workspaceService = new WorkspaceService(
                workspaceRepository, workspaceMemberRepo, userRepository, workspacePolicy);
        boardService = new BoardService(
                boardRepository, boardMemberRepo, userRepository, boardPolicy,
                subtaskRepository, commentRepository, cardAssigneeRepository,
                cardModuleRepository, cardRepository, workspaceMemberRepo);
    }

    // ── TC-1: OWNER changes MEMBER → ADMIN → succeeds ────────────────────────

    @Test
    void tc1_ownerCanChangeMemberToAdmin() {
        WorkspaceMember ownerMember = memberWith(workspaceId, ownerId, Role.OWNER);
        WorkspaceMember targetMember = memberWith(workspaceId, targetId, Role.MEMBER);

        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, targetId))
                .thenReturn(Optional.of(targetMember));
        when(workspaceMemberRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        workspaceService.updateMemberRole(workspaceId, ownerId, targetId, Role.ADMIN);

        ArgumentCaptor<WorkspaceMember> captor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(workspaceMemberRepo).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.ADMIN);
    }

    // ── TC-2: ADMIN changes MEMBER → VIEWER → succeeds ───────────────────────

    @Test
    void tc2_adminCanChangeMemberToViewer() {
        WorkspaceMember adminMember = memberWith(workspaceId, adminId, Role.ADMIN);
        WorkspaceMember targetMember = memberWith(workspaceId, targetId, Role.MEMBER);

        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, adminId))
                .thenReturn(Optional.of(adminMember));
        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, targetId))
                .thenReturn(Optional.of(targetMember));
        when(workspaceMemberRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        workspaceService.updateMemberRole(workspaceId, adminId, targetId, Role.VIEWER);

        ArgumentCaptor<WorkspaceMember> captor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(workspaceMemberRepo).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.VIEWER);
    }

    // ── TC-3: ADMIN tries to grant OWNER → throws 403 ────────────────────────

    @Test
    void tc3_adminCannotGrantOwner() {
        WorkspaceMember adminMember = memberWith(workspaceId, adminId, Role.ADMIN);

        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, adminId))
                .thenReturn(Optional.of(adminMember));

        assertThatThrownBy(() -> workspaceService.updateMemberRole(workspaceId, adminId, targetId, Role.OWNER))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(workspaceMemberRepo, never()).save(any());
    }

    // ── TC-4: MEMBER tries to change any role → throws 403 ───────────────────

    @Test
    void tc4_memberCannotChangeRole() {
        WorkspaceMember memberRecord = memberWith(workspaceId, memberId, Role.MEMBER);

        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, memberId))
                .thenReturn(Optional.of(memberRecord));

        assertThatThrownBy(() -> workspaceService.updateMemberRole(workspaceId, memberId, targetId, Role.VIEWER))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(workspaceMemberRepo, never()).save(any());
    }

    // ── TC-5: OWNER can grant OWNER role to another member ────────────────────

    @Test
    void tc5_ownerCanGrantOwnerToAnother() {
        WorkspaceMember ownerMember = memberWith(workspaceId, ownerId, Role.OWNER);
        WorkspaceMember targetMember = memberWith(workspaceId, targetId, Role.ADMIN);

        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, targetId))
                .thenReturn(Optional.of(targetMember));
        when(workspaceMemberRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        workspaceService.updateMemberRole(workspaceId, ownerId, targetId, Role.OWNER);

        ArgumentCaptor<WorkspaceMember> captor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(workspaceMemberRepo).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.OWNER);
    }

    // ── TC-6: workspace policy honors updated role immediately ────────────────

    @Test
    void tc6_policyHonorsPromotedAdminImmediately() {
        // After promotion, findByWorkspaceIdAndUserId returns ADMIN role
        WorkspaceMember promotedAdmin = memberWith(workspaceId, targetId, Role.ADMIN);
        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, targetId))
                .thenReturn(Optional.of(promotedAdmin));

        // assertAdminOrOwner should NOT throw for a newly promoted ADMIN
        workspacePolicy.assertAdminOrOwner(workspaceId, targetId);
        // no exception = policy immediately honors the new role
    }

    @Test
    void tc6_policyRejectsDemotedMember() {
        WorkspaceMember demotedMember = memberWith(workspaceId, targetId, Role.MEMBER);
        when(workspaceMemberRepo.findByWorkspaceIdAndUserId(workspaceId, targetId))
                .thenReturn(Optional.of(demotedMember));

        assertThatThrownBy(() -> workspacePolicy.assertAdminOrOwner(workspaceId, targetId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
    }

    // ── TC-7: board member role PATCH ─────────────────────────────────────────

    @Test
    void tc7_ownerCanChangeBoardMemberRole() {
        BoardMember ownerBm = boardMemberWith(boardId, ownerId, Role.OWNER);
        BoardMember targetBm = boardMemberWith(boardId, targetId, Role.MEMBER);

        when(boardMemberRepo.findByBoardIdAndUserId(boardId, ownerId))
                .thenReturn(Optional.of(ownerBm));
        when(boardMemberRepo.findByBoardIdAndUserId(boardId, targetId))
                .thenReturn(Optional.of(targetBm));
        when(boardMemberRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boardService.updateBoardMemberRole(boardId, ownerId, targetId, Role.ADMIN);

        ArgumentCaptor<BoardMember> captor = ArgumentCaptor.forClass(BoardMember.class);
        verify(boardMemberRepo).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void tc7_adminCanChangeBoardMemberRole() {
        BoardMember adminBm = boardMemberWith(boardId, adminId, Role.ADMIN);
        BoardMember targetBm = boardMemberWith(boardId, targetId, Role.VIEWER);

        when(boardMemberRepo.findByBoardIdAndUserId(boardId, adminId))
                .thenReturn(Optional.of(adminBm));
        when(boardMemberRepo.findByBoardIdAndUserId(boardId, targetId))
                .thenReturn(Optional.of(targetBm));
        when(boardMemberRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boardService.updateBoardMemberRole(boardId, adminId, targetId, Role.MEMBER);

        ArgumentCaptor<BoardMember> captor = ArgumentCaptor.forClass(BoardMember.class);
        verify(boardMemberRepo).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.MEMBER);
    }

    @Test
    void tc7_memberCannotChangeBoardMemberRole() {
        BoardMember memberBm = boardMemberWith(boardId, memberId, Role.MEMBER);

        when(boardMemberRepo.findByBoardIdAndUserId(boardId, memberId))
                .thenReturn(Optional.of(memberBm));

        assertThatThrownBy(() -> boardService.updateBoardMemberRole(boardId, memberId, targetId, Role.VIEWER))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(boardMemberRepo, never()).save(any());
    }

    @Test
    void tc7_adminCannotGrantOwnerOnBoard() {
        BoardMember adminBm = boardMemberWith(boardId, adminId, Role.ADMIN);

        when(boardMemberRepo.findByBoardIdAndUserId(boardId, adminId))
                .thenReturn(Optional.of(adminBm));

        assertThatThrownBy(() -> boardService.updateBoardMemberRole(boardId, adminId, targetId, Role.OWNER))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(boardMemberRepo, never()).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private WorkspaceMember memberWith(UUID wsId, UUID userId, Role role) {
        WorkspaceMember m = new WorkspaceMember();
        setField(m, "workspaceId", wsId);
        setField(m, "userId", userId);
        setField(m, "role", role);
        return m;
    }

    private BoardMember boardMemberWith(UUID bId, UUID userId, Role role) {
        BoardMember m = new BoardMember();
        m.setBoardId(bId);
        m.setUserId(userId);
        m.setRole(role);
        return m;
    }

    private static void setField(Object obj, String fieldName, Object value) {
        try {
            var f = findField(obj.getClass(), fieldName);
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
