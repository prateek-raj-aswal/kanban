package com.kanban.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TimelineCardResponse(
        UUID id,
        String title,
        String columnName,
        LocalDate startDate,
        LocalDate dueDate,
        String priority,
        List<UUID> assignees
) {}
