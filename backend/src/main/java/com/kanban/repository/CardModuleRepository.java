package com.kanban.repository;

import com.kanban.model.CardModule;
import com.kanban.model.CardModuleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CardModuleRepository extends JpaRepository<CardModule, CardModuleId> {
    List<CardModule> findByCard(UUID cardId);
    List<CardModule> findByCardIn(Collection<UUID> cardIds);
}
