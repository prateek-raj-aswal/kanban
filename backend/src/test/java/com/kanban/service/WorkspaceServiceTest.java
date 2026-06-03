package com.kanban.service;

import com.kanban.dto.request.CreateWorkspaceRequest;
import com.kanban.dto.response.WorkspaceResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Workspace;
import com.kanban.model.WorkspaceMember;
import com.kanban.repository.UserRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.repository.WorkspaceRepository;
import com.kanban.security.Role;
import com.kanban.security.WorkspaceAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkspaceServiceTest {

    @Mock WorkspaceRepository workspaceRepository;
    @Mock WorkspaceMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock WorkspaceAccessPolicy accessPolicy;

    @InjectMocks WorkspaceService workspaceService;

    private UUID userId;
    private UUID workspaceId;
    private Workspace workspace;

    @BeforeEach
    void setUp() {
        userId      = UUID.randomUUID();
        workspaceId = UUID.randomUUID();

        workspace = new Workspace();
        setField(workspace, "id", workspaceId);
        setField(workspace, "name", "My Workspace");
        setField(workspace, "ownerId", userId);
        setField(workspace, "createdAt", Instant.now());
        setField(workspace, "updatedAt", Instant.now());
    }

    // ── createWorkspace ───────────────────────────────────────────────────────

    @Test
    void createWorkspace_persistsWorkspaceAndOwnerMember() {
        when(workspaceRepository.save(any())).thenAnswer(inv -> {
            Workspace ws = inv.getArgument(0);
            setField(ws, "id", workspaceId);
            setField(ws, "createdAt", Instant.now());
            setField(ws, "updatedAt", Instant.now());
            return ws;
        });

        WorkspaceResponse res = workspaceService.createWorkspace(
                new CreateWorkspaceRequest("My Workspace"), userId);

        assertThat(res.id()).isEqualTo(workspaceId);
        assertThat(res.name()).isEqualTo("My Workspace");
        assertThat(res.ownerId()).isEqualTo(userId);
        assertThat(res.role()).isEqualTo("OWNER");

        ArgumentCaptor<WorkspaceMember> memberCaptor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(memberRepository).save(memberCaptor.capture());
        assertThat(memberCaptor.getValue().getWorkspaceId()).isEqualTo(workspaceId);
        assertThat(memberCaptor.getValue().getUserId()).isEqualTo(userId);
        assertThat(memberCaptor.getValue().getRole()).isEqualTo(Role.OWNER);
    }

    @Test
    void createWorkspace_savesWorkspaceWithCorrectName() {
        when(workspaceRepository.save(any())).thenAnswer(inv -> {
            Workspace ws = inv.getArgument(0);
            setField(ws, "id", workspaceId);
            setField(ws, "createdAt", Instant.now());
            setField(ws, "updatedAt", Instant.now());
            return ws;
        });

        workspaceService.createWorkspace(new CreateWorkspaceRequest("Team Alpha"), userId);

        ArgumentCaptor<Workspace> wsCaptor = ArgumentCaptor.forClass(Workspace.class);
        verify(workspaceRepository).save(wsCaptor.capture());
        assertThat(wsCaptor.getValue().getName()).isEqualTo("Team Alpha");
        assertThat(wsCaptor.getValue().getOwnerId()).isEqualTo(userId);
    }

    // ── getWorkspace ──────────────────────────────────────────────────────────

    @Test
    void getWorkspace_returnsWorkspaceWithCallerRole() {
        WorkspaceMember ownerMember = new WorkspaceMember();
        setField(ownerMember, "workspaceId", workspaceId);
        setField(ownerMember, "userId", userId);
        setField(ownerMember, "role", Role.OWNER);
        setField(ownerMember, "joinedAt", Instant.now());

        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(ownerMember));

        WorkspaceResponse res = workspaceService.getWorkspace(workspaceId, userId);

        assertThat(res.id()).isEqualTo(workspaceId);
        assertThat(res.name()).isEqualTo("My Workspace");
        assertThat(res.role()).isEqualTo("OWNER");
    }

    @Test
    void getWorkspace_throwsNotFoundWhenMissing() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workspaceService.getWorkspace(workspaceId, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void getWorkspace_throwsForbiddenWhenNotMember() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> workspaceService.getWorkspace(workspaceId, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
    }

    // ── listWorkspaces ────────────────────────────────────────────────────────

    @Test
    void listWorkspaces_returnsWorkspacesForUser() {
        WorkspaceMember member = new WorkspaceMember();
        setField(member, "workspaceId", workspaceId);
        setField(member, "userId", userId);
        setField(member, "role", Role.MEMBER);
        setField(member, "joinedAt", Instant.now());

        when(workspaceRepository.findAllByMemberUserId(userId)).thenReturn(List.of(workspace));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(member));

        List<WorkspaceResponse> result = workspaceService.listWorkspaces(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(workspaceId);
        assertThat(result.get(0).role()).isEqualTo("MEMBER");
    }

    @Test
    void listWorkspaces_returnsEmptyWhenNoWorkspaces() {
        when(workspaceRepository.findAllByMemberUserId(userId)).thenReturn(List.of());

        List<WorkspaceResponse> result = workspaceService.listWorkspaces(userId);

        assertThat(result).isEmpty();
    }

    // ── deleteWorkspace ───────────────────────────────────────────────────────

    @Test
    void deleteWorkspace_deletesWhenCallerIsOwner() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));

        workspaceService.deleteWorkspace(workspaceId, userId);

        verify(workspaceRepository).delete(workspace);
    }

    @Test
    void deleteWorkspace_throwsForbiddenWhenCallerIsNotOwner() {
        UUID otherId = UUID.randomUUID();
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));

        assertThatThrownBy(() -> workspaceService.deleteWorkspace(workspaceId, otherId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);
        verify(workspaceRepository, never()).delete(any());
    }

    @Test
    void deleteWorkspace_throwsNotFoundWhenMissing() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workspaceService.deleteWorkspace(workspaceId, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
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
