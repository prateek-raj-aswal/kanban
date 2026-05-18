package com.kanban.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AddWorkspaceMemberRequest(
        @NotNull UUID userId,
        String role
) {}
