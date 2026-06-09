package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record CreateCardRequest(
        @NotBlank String title,
        String description,
        LocalDate dueDate,
        String priority,
        String type
) {}
