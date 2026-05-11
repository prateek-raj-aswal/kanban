package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record InvitationResponse(
        UUID id,
        UUID boardId,
        String inviteeEmail,
        String token,
        String status,
        Instant expiresAt
) {}
