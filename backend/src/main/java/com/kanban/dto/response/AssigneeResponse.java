package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AssigneeResponse(
        UUID userId,
        String email,
        String displayName,
        Instant assignedAt
) {}
