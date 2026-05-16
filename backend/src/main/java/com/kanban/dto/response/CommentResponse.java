package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(UUID id, UUID cardId, UUID authorId, String authorName,
                               String body, Instant createdAt, Instant updatedAt) {}
