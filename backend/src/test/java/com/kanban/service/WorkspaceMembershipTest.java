package com.kanban.service;

import com.kanban.dto.request.AddWorkspaceMemberRequest;
import com.kanban.exception.ApiException;
import com.kanban.model.Workspace;
import com.kanban.model.WorkspaceMember;
import com.kanban.repository.UserRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkspaceMembershipTest {

    @Mock WorkspaceRepository workspaceRepository;
    @Mock WorkspaceMemberRepository memberRepository;
    @Mock UserRepository userRepository;

    @InjectMocks WorkspaceService workspaceService;

    private UUID ownerId;
    private UUID workspaceId;
    private UUID targetUserId;
    private Workspace workspace;
    private WorkspaceMember ownerMember;

    @BeforeEach
    void setUp() {
        ownerId       = UUID.randomUUID();
        workspaceId   = UUID.randomUUID();
        targetUserId  = UUID.randomUUID();

        workspace = new Workspace();
        setField(workspace, "id", workspaceId);
        setField(workspace, "name", "Workspace");
        setField(workspace, "ownerId", ownerId);
        setField(workspace, "createdAt", Instant.now());
        setField(workspace, "updatedAt", Instant.now());

        ownerMember = new WorkspaceMember();
        setField(ownerMember, "workspaceId", workspaceId);
        setField(ownerMember, "userId", ownerId);
        setField(ownerMember, "role", "OWNER");
        setField(ownerMember, "joinedAt", Instant.now());
    }

    // ── addMember ─────────────────────────────────────────────────────────────

    @Test
    void addMember_savesMemberWithDefaultRole() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(memberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUserId)).thenReturn(false);

        workspaceService.addMember(workspaceId, new AddWorkspaceMemberRequest(targetUserId, null), ownerId);

        ArgumentCaptor<WorkspaceMember> captor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(memberRepository).save(captor.capture());
        assertThat(captor.getValue().getWorkspaceId()).isEqualTo(workspaceId);
        assertThat(captor.getValue().getUserId()).isEqualTo(targetUserId);
        assertThat(captor.getValue().getRole()).isEqualTo("MEMBER");
    }

    @Test
    void addMember_savesMemberWithExplicitRole() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(memberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUserId)).thenReturn(false);

        workspaceService.addMember(workspaceId, new AddWorkspaceMemberRequest(targetUserId, "ADMIN"), ownerId);

        ArgumentCaptor<WorkspaceMember> captor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(memberRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo("ADMIN");
    }

    @Test
    void addMember_throwsConflictWhenAlreadyMember() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(memberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUserId)).thenReturn(true);

        assertThatThrownBy(() ->
                workspaceService.addMember(workspaceId, new AddWorkspaceMemberRequest(targetUserId, null), ownerId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
        verify(memberRepository, never()).save(any());
    }

    @Test
    void addMember_throwsForbiddenWhenCallerIsRegularMember() {
        WorkspaceMember regularMember = new WorkspaceMember();
        setField(regularMember, "workspaceId", workspaceId);
        setField(regularMember, "userId", ownerId);
        setField(regularMember, "role", "MEMBER");
        setField(regularMember, "joinedAt", Instant.now());

        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(regularMember));

        assertThatThrownBy(() ->
                workspaceService.addMember(workspaceId, new AddWorkspaceMemberRequest(targetUserId, null), ownerId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
    }

    @Test
    void addMember_throwsNotFoundWhenWorkspaceMissing() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                workspaceService.addMember(workspaceId, new AddWorkspaceMemberRequest(targetUserId, null), ownerId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // ── removeMember ──────────────────────────────────────────────────────────

    @Test
    void removeMember_deletesNonOwnerMember() {
        WorkspaceMember targetMember = new WorkspaceMember();
        setField(targetMember, "workspaceId", workspaceId);
        setField(targetMember, "userId", targetUserId);
        setField(targetMember, "role", "MEMBER");
        setField(targetMember, "joinedAt", Instant.now());

        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId))
                .thenReturn(Optional.of(targetMember));

        workspaceService.removeMember(workspaceId, targetUserId, ownerId);

        verify(memberRepository).deleteByWorkspaceIdAndUserId(workspaceId, targetUserId);
    }

    @Test
    void removeMember_throwsForbiddenWhenAttemptingToRemoveOwner() {
        WorkspaceMember ownerTarget = new WorkspaceMember();
        setField(ownerTarget, "workspaceId", workspaceId);
        setField(ownerTarget, "userId", targetUserId);
        setField(ownerTarget, "role", "OWNER");
        setField(ownerTarget, "joinedAt", Instant.now());

        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId))
                .thenReturn(Optional.of(ownerMember));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId))
                .thenReturn(Optional.of(ownerTarget));

        assertThatThrownBy(() -> workspaceService.removeMember(workspaceId, targetUserId, ownerId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
        verify(memberRepository, never()).deleteByWorkspaceIdAndUserId(any(), any());
    }

    // ── helper ────────────────────────────────────────────────────────────────

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
