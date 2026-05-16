package com.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record SubtaskResponse(UUID id, UUID cardId, String title, boolean completed, double position, Instant createdAt) {}
