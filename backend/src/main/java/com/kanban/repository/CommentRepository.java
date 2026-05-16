package com.kanban.repository;

import com.kanban.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByCardIdOrderByCreatedAtAsc(UUID cardId);

    @Query("SELECT c.card.id, COUNT(c) FROM Comment c WHERE c.card.id IN :cardIds GROUP BY c.card.id")
    List<Object[]> countByCardIds(Collection<UUID> cardIds);

    default Map<UUID, Integer> getCountsByCardIds(Collection<UUID> cardIds) {
        return countByCardIds(cardIds).stream().collect(Collectors.toMap(
            row -> (UUID) row[0],
            row -> ((Number) row[1]).intValue()
        ));
    }
}
