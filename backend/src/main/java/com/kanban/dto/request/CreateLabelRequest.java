package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateLabelRequest(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a 6-digit hex code") String color
) {}
