package com.kanban.repository;

import com.kanban.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findByCardIdOrderByCreatedAtDesc(UUID cardId, Pageable pageable);
    List<ActivityLog> findByBoardIdOrderByCreatedAtDesc(UUID boardId, Pageable pageable);
}
