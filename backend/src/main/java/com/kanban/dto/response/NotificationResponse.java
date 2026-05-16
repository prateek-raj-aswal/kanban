package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(UUID id, UUID cardId, UUID boardId, String type,
                                    String message, boolean read, Instant createdAt) {}
