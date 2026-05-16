package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateSubtaskRequest(@NotBlank String title) {}
