package com.kanban.dto.response;

import java.util.UUID;

public record ModuleResponse(UUID id, UUID boardId, String name) {}
