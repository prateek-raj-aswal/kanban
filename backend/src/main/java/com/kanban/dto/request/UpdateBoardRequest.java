package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBoardRequest(
        @NotBlank @Size(min = 1, max = 255) String name,
        String description,
        String groupBy
) {}
