package com.kanban.security;

import com.kanban.exception.ApiException;
import com.kanban.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class WorkspaceAccessPolicy {

    private final WorkspaceMemberRepository memberRepository;

    public WorkspaceAccessPolicy(WorkspaceMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    /** Throws 403 if {@code userId} is not a member of {@code workspaceId}. */
    public void assertMember(UUID workspaceId, UUID userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "NOT_WORKSPACE_MEMBER", "You are not a member of this workspace");
        }
    }

    /**
     * Throws 403 if {@code userId} is not ADMIN or OWNER of {@code workspaceId}.
     * MEMBER and VIEWER are rejected.
     */
    public void assertAdminOrOwner(UUID workspaceId, UUID userId) {
        memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(m -> m.getRole() != null && m.getRole().ordinal() >= Role.ADMIN.ordinal())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "NOT_WORKSPACE_ADMIN", "Only workspace OWNER or ADMIN can perform this action"));
    }

    /** Throws 403 if {@code userId} is not OWNER of {@code workspaceId}. */
    public void assertOwner(UUID workspaceId, UUID userId) {
        memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(m -> m.getRole() == Role.OWNER)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "NOT_WORKSPACE_OWNER", "Only the workspace owner can perform this action"));
    }
}
