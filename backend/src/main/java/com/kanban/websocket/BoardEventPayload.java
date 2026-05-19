package com.kanban.websocket;

import com.kanban.dto.response.LabelResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BoardEventPayload(String eventType, UUID boardId, Instant timestamp, Object data) {

    public static BoardEventPayload of(String eventType, UUID boardId, Object data) {
        return new BoardEventPayload(eventType, boardId, Instant.now(), data);
    }

    public record CardCreatedData(
            UUID id, UUID columnId, String title, double position,
            List<UUID> assignees, LocalDate dueDate, String priority, List<LabelResponse> labels) {}

    public record CardUpdatedData(
            UUID id, UUID columnId, String title, String description,
            List<UUID> assignees, LocalDate dueDate, String priority, List<LabelResponse> labels, Instant updatedAt) {}

    public record CardMovedData(
            UUID id, UUID fromColumnId, UUID toColumnId, double newPosition, Instant updatedAt) {}

    public record CardDeletedData(UUID id, UUID columnId) {}

    public record ColumnCreatedData(UUID id, String name, double position) {}

    public record ColumnUpdatedData(UUID id, String name) {}

    public record ColumnReorderedData(List<ColumnPosition> columns) {}

    public record ColumnDeletedData(UUID id) {}

    public record ColumnColorUpdatedData(UUID id, String headerColor) {}

    public record ColumnPosition(UUID id, double position) {}

    public record BoardStarredData(UUID boardId, UUID userId, java.time.Instant starredAt) {}

    public record BoardUnstarredData(UUID boardId, UUID userId) {}

    public record AttachmentUploadedData(
            UUID attachmentId, UUID cardId, UUID uploaderId,
            String originalFilename, String url,
            long sizeBytes, String contentType, Instant createdAt) {}

    public record AttachmentDeletedData(UUID attachmentId, UUID cardId) {}
}
