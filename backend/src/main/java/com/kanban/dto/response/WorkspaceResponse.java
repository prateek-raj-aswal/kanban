package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceResponse(
        UUID id,
        String name,
        UUID ownerId,
        String role,
        Instant createdAt,
        Instant updatedAt
) {}
