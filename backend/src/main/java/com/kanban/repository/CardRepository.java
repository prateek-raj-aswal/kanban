package com.kanban.repository;

import com.kanban.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {

    @Query("SELECT c FROM Card c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Card> findActiveById(UUID id);

    @Query("SELECT MAX(c.position) FROM Card c WHERE c.column.id = :columnId AND c.deletedAt IS NULL")
    Optional<Double> findMaxPositionByColumnId(UUID columnId);

    @Query("""
        SELECT c FROM Card c
        WHERE c.column.board.id = :boardId
          AND c.deletedAt IS NULL
          AND (:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:assigneeId IS NULL OR c.assigneeId = :assigneeId)
          AND (:priority IS NULL OR c.priority = :priority)
        ORDER BY c.column.position, c.position
        """)
    List<Card> searchCards(UUID boardId, String keyword, UUID assigneeId, String priority);
}
