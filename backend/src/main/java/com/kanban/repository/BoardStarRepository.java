package com.kanban.repository;

import com.kanban.model.BoardStar;
import com.kanban.model.BoardStarId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardStarRepository extends JpaRepository<BoardStar, BoardStarId> {

    boolean existsByUserIdAndBoardId(UUID userId, UUID boardId);

    void deleteByUserIdAndBoardId(UUID userId, UUID boardId);

    List<BoardStar> findByUserIdOrderByStarredAtDesc(UUID userId);
}
