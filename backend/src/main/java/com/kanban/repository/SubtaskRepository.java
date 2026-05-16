package com.kanban.repository;

import com.kanban.model.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public interface SubtaskRepository extends JpaRepository<Subtask, UUID> {
    List<Subtask> findByCardIdOrderByPositionAsc(UUID cardId);

    @Query("SELECT MAX(s.position) FROM Subtask s WHERE s.card.id = :cardId")
    Optional<Double> findMaxPositionByCardId(UUID cardId);

    @Query("SELECT s.card.id, COUNT(s), SUM(CASE WHEN s.completed = true THEN 1 ELSE 0 END) FROM Subtask s WHERE s.card.id IN :cardIds GROUP BY s.card.id")
    List<Object[]> countByCardIds(Collection<UUID> cardIds);

    default Map<UUID, int[]> getCountsByCardIds(Collection<UUID> cardIds) {
        return countByCardIds(cardIds).stream().collect(Collectors.toMap(
            row -> (UUID) row[0],
            row -> new int[]{((Number) row[1]).intValue(), ((Number) row[2]).intValue()}
        ));
    }
}
