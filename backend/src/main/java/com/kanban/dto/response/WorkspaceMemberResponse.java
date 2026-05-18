package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceMemberResponse(
        UUID userId,
        String email,
        String displayName,
        String role,
        Instant joinedAt
) {}
