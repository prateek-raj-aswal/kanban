package com.kanban.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BoardResponse(
        UUID id,
        String name,
        UUID ownerId,
        String role,
        Instant createdAt,
        List<ColumnResponse> columns
) {}
