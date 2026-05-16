package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ActivityLogResponse(UUID id, UUID boardId, UUID cardId, UUID actorId,
                                   String actorName, String eventType, String summary, Instant createdAt) {}
