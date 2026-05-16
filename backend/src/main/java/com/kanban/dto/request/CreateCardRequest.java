package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;

public record CreateCardRequest(
        @NotBlank String title,
        String description,
        LocalDate dueDate,
        UUID assigneeId,
        String priority
) {}
