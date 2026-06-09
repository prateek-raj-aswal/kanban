package com.kanban.service;

import com.kanban.model.WorkspaceIdCounter;
import com.kanban.repository.WorkspaceIdCounterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class ReadableIdService {

    private static final Map<String, String> PREFIX = Map.of(
            "STORY",   "US",
            "FEATURE", "FEAT",
            "BUG",     "BUG"
    );

    private final WorkspaceIdCounterRepository counterRepository;

    public ReadableIdService(WorkspaceIdCounterRepository counterRepository) {
        this.counterRepository = counterRepository;
    }

    /**
     * Atomically allocates the next readable ID for the given workspace and item type.
     * Must be called inside an active @Transactional context.
     */
    @Transactional
    public String allocate(UUID workspaceId, String itemType) {
        String prefix = PREFIX.get(itemType);
        if (prefix == null) {
            throw new IllegalArgumentException("Unknown item type: " + itemType);
        }

        counterRepository.upsertIfAbsent(workspaceId, itemType);

        WorkspaceIdCounter counter = counterRepository.findByIdForUpdate(workspaceId, itemType)
                .orElseThrow(() -> new IllegalStateException("Counter row missing after upsert"));

        int next = counter.getLastCounter() + 1;
        counter.setLastCounter(next);
        counterRepository.save(counter);

        return prefix + "-" + String.format("%03d", next);
    }
}
