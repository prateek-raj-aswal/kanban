package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record IssueResponse(
        UUID id,
        String title,
        String description,
        String status,
        UUID parentCardId,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt,
        String type,
        String readableId
) {}
