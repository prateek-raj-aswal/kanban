package com.kanban.repository;

import com.kanban.model.WorkspaceIdCounter;
import com.kanban.model.WorkspaceIdCounterId;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WorkspaceIdCounterRepository extends JpaRepository<WorkspaceIdCounter, WorkspaceIdCounterId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM WorkspaceIdCounter c WHERE c.workspaceId = :workspaceId AND c.itemType = :itemType")
    Optional<WorkspaceIdCounter> findByIdForUpdate(@Param("workspaceId") UUID workspaceId,
                                                    @Param("itemType") String itemType);

    @Modifying
    @Query(value = """
            INSERT INTO workspace_id_counters (workspace_id, item_type, last_counter)
            VALUES (:workspaceId, :itemType, 0)
            ON CONFLICT (workspace_id, item_type) DO NOTHING
            """, nativeQuery = true)
    void upsertIfAbsent(@Param("workspaceId") UUID workspaceId, @Param("itemType") String itemType);
}
