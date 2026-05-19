package com.kanban.controller;

import com.kanban.dto.request.CreateColumnRequest;
import com.kanban.dto.request.ReorderColumnsRequest;
import com.kanban.dto.request.UpdateColumnRequest;
import com.kanban.dto.response.ColumnResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.ColumnService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ColumnController {

    private final ColumnService columnService;

    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @PostMapping("/api/v1/boards/{boardId}/columns")
    public ResponseEntity<ColumnResponse> create(
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateColumnRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(columnService.createColumn(boardId, request, user.id()));
    }

    @PatchMapping("/api/v1/columns/{columnId}")
    public ResponseEntity<ColumnResponse> update(
            @PathVariable UUID columnId,
            @Valid @RequestBody UpdateColumnRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(columnService.updateColumn(columnId, request, user.id()));
    }

    @DeleteMapping("/api/v1/columns/{columnId}")
    public ResponseEntity<Void> delete(@PathVariable UUID columnId,
                                       @AuthenticationPrincipal AuthenticatedUser user) {
        columnService.deleteColumn(columnId, user.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/v1/boards/{boardId}/columns/reorder")
    public ResponseEntity<List<ColumnResponse>> reorder(
            @PathVariable UUID boardId,
            @Valid @RequestBody ReorderColumnsRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(columnService.reorderColumns(boardId, request.columnIds(), user.id()));
    }
}
