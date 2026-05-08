package com.kanban.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReorderColumnsRequest(
        @NotNull @NotEmpty List<UUID> columnIds
) {}
