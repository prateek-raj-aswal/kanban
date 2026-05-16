package com.kanban.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CardResponse(
        UUID id,
        UUID columnId,
        String title,
        String description,
        double position,
        UUID assigneeId,
        LocalDate dueDate,
        String priority,
        List<LabelResponse> labels,
        int subtaskTotal,
        int subtaskDone,
        int commentCount,
        Instant createdAt,
        Instant updatedAt
) {}
