package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateCommentRequest(@NotBlank String body) {}
