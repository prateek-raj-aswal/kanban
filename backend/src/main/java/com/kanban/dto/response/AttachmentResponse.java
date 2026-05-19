package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        UUID cardId,
        String filename,
        String url,
        String contentType,
        long sizeBytes,
        UUID uploadedBy,
        Instant uploadedAt
) {}
