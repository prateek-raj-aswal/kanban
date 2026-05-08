package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record MemberResponse(
        UUID userId,
        String displayName,
        String email,
        String role,
        Instant joinedAt
) {}
