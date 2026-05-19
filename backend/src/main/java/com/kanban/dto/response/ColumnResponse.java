package com.kanban.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ColumnResponse(
        UUID id,
        UUID boardId,
        String name,
        double position,
        Instant createdAt,
        List<CardResponse> cards,
        String headerColor
) {}
