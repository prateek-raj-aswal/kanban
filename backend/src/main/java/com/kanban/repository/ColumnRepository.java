package com.kanban.repository;

import com.kanban.model.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ColumnRepository extends JpaRepository<BoardColumn, UUID> {

    @Query("SELECT c FROM BoardColumn c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<BoardColumn> findActiveById(UUID id);

    @Query("SELECT c FROM BoardColumn c WHERE c.board.id = :boardId AND c.deletedAt IS NULL ORDER BY c.position ASC")
    List<BoardColumn> findActiveByBoardId(UUID boardId);

    @Query("SELECT MAX(c.position) FROM BoardColumn c WHERE c.board.id = :boardId AND c.deletedAt IS NULL")
    Optional<Double> findMaxPositionByBoardId(UUID boardId);
}
