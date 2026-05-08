package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
        UUID id,
        String email,
        String displayName,
        Instant createdAt
) {}
