package com.kanban.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MoveCardRequest(
        @NotNull UUID targetColumnId,
        @NotNull Double position
) {}
