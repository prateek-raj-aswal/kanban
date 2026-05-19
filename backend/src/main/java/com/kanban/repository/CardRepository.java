package com.kanban.repository;

import com.kanban.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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
          AND (:assigneeId IS NULL OR EXISTS (
              SELECT ca FROM CardAssignee ca WHERE ca.cardId = c.id AND ca.userId = :assigneeId))
          AND (:priority IS NULL OR c.priority = :priority)
        ORDER BY c.column.position, c.position
        """)
    List<Card> searchCards(UUID boardId, String keyword, UUID assigneeId, String priority);

    @Query("""
        SELECT DISTINCT c FROM Card c
        JOIN FETCH c.column col
        JOIN FETCH col.board b
        JOIN CardAssignee ca ON ca.cardId = c.id
        WHERE ca.userId = :userId
          AND c.deletedAt IS NULL
        ORDER BY c.dueDate ASC NULLS LAST
        """)
    List<Card> findInboxCards(@Param("userId") UUID userId);

    @Query("""
        SELECT DISTINCT c FROM Card c
        JOIN FETCH c.column col
        JOIN FETCH col.board b
        JOIN CardAssignee ca ON ca.cardId = c.id
        WHERE ca.userId = :userId
          AND c.dueDate = :today
          AND c.deletedAt IS NULL
        ORDER BY c.createdAt ASC
        """)
    List<Card> findTodayCards(@Param("userId") UUID userId, @Param("today") LocalDate today);

    @Query("""
        SELECT DISTINCT c FROM Card c
        JOIN FETCH c.column col
        JOIN FETCH col.board b
        JOIN CardAssignee ca ON ca.cardId = c.id
        WHERE ca.userId = :userId
          AND c.dueDate > :today
          AND c.dueDate <= :endDate
          AND c.deletedAt IS NULL
        ORDER BY c.dueDate ASC
        """)
    List<Card> findUpcomingCards(@Param("userId") UUID userId,
                                 @Param("today") LocalDate today,
                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT c.column.board.id, COUNT(c) FROM Card c WHERE c.column.board.id IN :boardIds AND c.deletedAt IS NULL GROUP BY c.column.board.id")
    List<Object[]> countActiveCardsByBoardIds(@Param("boardIds") List<UUID> boardIds);

    @Query("""
        SELECT c FROM Card c
        JOIN FETCH c.column col
        JOIN FETCH col.board b
        WHERE col.board.id = :boardId
          AND c.deletedAt IS NULL
          AND (c.startDate IS NOT NULL OR c.dueDate IS NOT NULL)
        ORDER BY COALESCE(c.startDate, c.dueDate) ASC
        """)
    List<Card> findTimelineCards(@Param("boardId") UUID boardId);
}
