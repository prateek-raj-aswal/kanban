package com.kanban.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record SmartCardResponse(
        UUID id,
        String title,
        UUID boardId,
        String boardName,
        UUID columnId,
        String columnName,
        LocalDate dueDate,
        LocalDate startDate,
        String priority
) {}
