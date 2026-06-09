package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateIssueRequest(
        @NotBlank String title,
        String description,
        UUID parentCardId,
        String type,
        UUID workspaceId
) {}
