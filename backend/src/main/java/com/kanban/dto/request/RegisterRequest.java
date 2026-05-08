package com.kanban.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 1, max = 100) String displayName,
        @NotBlank @Size(min = 8) String password
) {}
