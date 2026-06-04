package com.kanban.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddWorkspaceMemberRequest(
        @NotBlank @Email String email,
        String role
) {}
