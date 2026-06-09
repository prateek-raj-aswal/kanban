package com.kanban.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateCardRequest(
        String title,
        String description,
        LocalDate startDate,
        LocalDate dueDate,
        String priority,
        List<UUID> labelIds,
        String color,
        String type
) {}
