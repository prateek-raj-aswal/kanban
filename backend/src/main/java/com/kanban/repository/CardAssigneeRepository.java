package com.kanban.repository;

import com.kanban.model.CardAssignee;
import com.kanban.model.CardAssigneeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CardAssigneeRepository extends JpaRepository<CardAssignee, CardAssigneeId> {

    List<CardAssignee> findByCardId(UUID cardId);

    List<CardAssignee> findByCardIdIn(Collection<UUID> cardIds);

    boolean existsByCardIdAndUserId(UUID cardId, UUID userId);

    void deleteByCardIdAndUserId(UUID cardId, UUID userId);
}
