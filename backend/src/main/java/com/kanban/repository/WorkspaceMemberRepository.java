package com.kanban.repository;

import com.kanban.model.WorkspaceMember;
import com.kanban.model.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {

    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    void deleteByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
