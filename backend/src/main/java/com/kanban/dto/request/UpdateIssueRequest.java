package com.kanban.dto.request;

import java.util.UUID;

public record UpdateIssueRequest(
        String title,
        String description,
        String status,
        UUID parentCardId
) {}
