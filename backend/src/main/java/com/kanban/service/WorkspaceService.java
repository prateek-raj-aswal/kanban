package com.kanban.service;

import com.kanban.dto.request.AddWorkspaceMemberRequest;
import com.kanban.dto.request.CreateWorkspaceRequest;
import com.kanban.dto.request.UpdateWorkspaceRequest;
import com.kanban.dto.response.WorkspaceMemberResponse;
import com.kanban.dto.response.WorkspaceResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Workspace;
import com.kanban.model.WorkspaceMember;
import com.kanban.repository.UserRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.repository.WorkspaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository memberRepository,
                            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest req, UUID actorId) {
        Workspace ws = new Workspace();
        ws.setName(req.name());
        ws.setOwnerId(actorId);
        ws = workspaceRepository.save(ws);

        WorkspaceMember owner = new WorkspaceMember();
        owner.setWorkspaceId(ws.getId());
        owner.setUserId(actorId);
        owner.setRole("OWNER");
        memberRepository.save(owner);

        return toResponse(ws, "OWNER");
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> listWorkspaces(UUID userId) {
        return workspaceRepository.findAllByMemberUserId(userId).stream()
                .map(ws -> {
                    String role = memberRepository.findByWorkspaceIdAndUserId(ws.getId(), userId)
                            .map(WorkspaceMember::getRole).orElse("MEMBER");
                    return toResponse(ws, role);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID workspaceId, UUID userId) {
        Workspace ws = findOrThrow(workspaceId);
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "NOT_WORKSPACE_MEMBER", "You are not a member of this workspace"));
        return toResponse(ws, member.getRole());
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, UpdateWorkspaceRequest req, UUID actorId) {
        Workspace ws = findOrThrow(workspaceId);
        assertAdminOrOwner(workspaceId, actorId);
        ws.setName(req.name());
        ws = workspaceRepository.save(ws);
        String role = memberRepository.findByWorkspaceIdAndUserId(workspaceId, actorId)
                .map(WorkspaceMember::getRole).orElse("MEMBER");
        return toResponse(ws, role);
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, UUID actorId) {
        Workspace ws = findOrThrow(workspaceId);
        if (!ws.getOwnerId().equals(actorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "NOT_WORKSPACE_OWNER", "Only the workspace owner can delete it");
        }
        workspaceRepository.delete(ws);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> listMembers(UUID workspaceId, UUID actorId) {
        findOrThrow(workspaceId);
        assertMember(workspaceId, actorId);

        List<WorkspaceMember> members = memberRepository.findByWorkspaceId(workspaceId);
        List<UUID> userIds = members.stream().map(WorkspaceMember::getUserId).toList();
        var userMap = userRepository.findAllById(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.kanban.model.User::getId,
                        u -> u));

        return members.stream()
                .map(m -> {
                    var u = userMap.get(m.getUserId());
                    return new WorkspaceMemberResponse(
                            m.getUserId(),
                            u != null ? u.getEmail() : "",
                            u != null ? u.getDisplayName() : null,
                            m.getRole(),
                            m.getJoinedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public void addMember(UUID workspaceId, AddWorkspaceMemberRequest req, UUID actorId) {
        findOrThrow(workspaceId);
        assertAdminOrOwner(workspaceId, actorId);

        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, req.userId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "ALREADY_MEMBER", "User is already a member of this workspace");
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspaceId);
        member.setUserId(req.userId());
        member.setRole(req.role() != null ? req.role() : "MEMBER");
        memberRepository.save(member);
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID targetUserId, UUID actorId) {
        Workspace ws = findOrThrow(workspaceId);
        assertAdminOrOwner(workspaceId, actorId);

        WorkspaceMember target = memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "MEMBER_NOT_FOUND", "Member not found in workspace"));

        if ("OWNER".equals(target.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "CANNOT_REMOVE_OWNER", "Cannot remove the workspace owner");
        }
        memberRepository.deleteByWorkspaceIdAndUserId(workspaceId, targetUserId);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Workspace findOrThrow(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "WORKSPACE_NOT_FOUND", "Workspace not found"));
    }

    private void assertMember(UUID workspaceId, UUID userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "NOT_WORKSPACE_MEMBER", "You are not a member of this workspace");
        }
    }

    private void assertAdminOrOwner(UUID workspaceId, UUID userId) {
        WorkspaceMember m = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "NOT_WORKSPACE_MEMBER", "You are not a member of this workspace"));
        if (!"OWNER".equals(m.getRole()) && !"ADMIN".equals(m.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "NOT_WORKSPACE_ADMIN", "Only workspace OWNER or ADMIN can perform this action");
        }
    }

    private WorkspaceResponse toResponse(Workspace ws, String role) {
        return new WorkspaceResponse(ws.getId(), ws.getName(), ws.getOwnerId(),
                role, ws.getCreatedAt(), ws.getUpdatedAt());
    }
}
