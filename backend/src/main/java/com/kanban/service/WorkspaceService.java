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
import com.kanban.security.Role;
import com.kanban.security.WorkspaceAccessPolicy;
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
    private final WorkspaceAccessPolicy accessPolicy;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository memberRepository,
                            UserRepository userRepository,
                            WorkspaceAccessPolicy accessPolicy) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.accessPolicy = accessPolicy;
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
        owner.setRole(Role.OWNER);
        memberRepository.save(owner);

        return toResponse(ws, Role.OWNER.name());
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> listWorkspaces(UUID userId) {
        return workspaceRepository.findAllByMemberUserId(userId).stream()
                .map(ws -> {
                    String role = memberRepository.findByWorkspaceIdAndUserId(ws.getId(), userId)
                            .map(WorkspaceMember::getRoleString).orElse(Role.MEMBER.name());
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
        return toResponse(ws, member.getRoleString());
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, UpdateWorkspaceRequest req, UUID actorId) {
        Workspace ws = findOrThrow(workspaceId);
        accessPolicy.assertAdminOrOwner(workspaceId, actorId);
        ws.setName(req.name());
        ws = workspaceRepository.save(ws);
        String role = memberRepository.findByWorkspaceIdAndUserId(workspaceId, actorId)
                .map(WorkspaceMember::getRoleString).orElse(Role.MEMBER.name());
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
        accessPolicy.assertMember(workspaceId, actorId);

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
                            m.getRoleString(),
                            m.getJoinedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public WorkspaceMemberResponse addMember(UUID workspaceId, AddWorkspaceMemberRequest req, UUID actorId) {
        findOrThrow(workspaceId);
        accessPolicy.assertAdminOrOwner(workspaceId, actorId);

        com.kanban.model.User target = userRepository.findActiveByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND", "No user found with the provided email"));

        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, target.getId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "ALREADY_MEMBER", "User is already a member of this workspace");
        }

        Role role;
        try {
            role = req.role() != null ? Role.valueOf(req.role().toUpperCase()) : Role.MEMBER;
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Provided role is not valid");
        }
        if (role == Role.OWNER) {
            accessPolicy.assertOwner(workspaceId, actorId);
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspaceId);
        member.setUserId(target.getId());
        member.setRole(role);
        memberRepository.save(member);

        return new WorkspaceMemberResponse(
                target.getId(),
                target.getEmail(),
                target.getDisplayName(),
                role.name(),
                member.getJoinedAt()
        );
    }

    @Transactional
    public void updateMemberRole(UUID workspaceId, UUID actorId, UUID targetUserId, Role newRole) {
        accessPolicy.assertAdminOrOwner(workspaceId, actorId);
        if (newRole == Role.OWNER) {
            accessPolicy.assertOwner(workspaceId, actorId);
        }
        WorkspaceMember target = memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "MEMBER_NOT_FOUND", "Member not found in workspace"));
        target.setRole(newRole);
        memberRepository.save(target);
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID targetUserId, UUID actorId) {
        Workspace ws = findOrThrow(workspaceId);
        accessPolicy.assertAdminOrOwner(workspaceId, actorId);

        WorkspaceMember target = memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "MEMBER_NOT_FOUND", "Member not found in workspace"));

        if (target.getRole() == Role.OWNER) {
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

    private WorkspaceResponse toResponse(Workspace ws, String role) {
        return new WorkspaceResponse(ws.getId(), ws.getName(), ws.getOwnerId(),
                role, ws.getCreatedAt(), ws.getUpdatedAt());
    }
}
