package com.kanban.dto.response;

import java.util.UUID;

public record LabelResponse(UUID id, String name, String color) {}
