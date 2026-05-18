package com.kanban.controller;

import com.kanban.dto.request.AddAssigneeRequest;
import com.kanban.dto.response.AssigneeResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.CardAssigneeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cards")
public class CardAssigneeController {

    private final CardAssigneeService cardAssigneeService;

    public CardAssigneeController(CardAssigneeService cardAssigneeService) {
        this.cardAssigneeService = cardAssigneeService;
    }

    @GetMapping("/{cardId}/assignees")
    public ResponseEntity<List<AssigneeResponse>> list(
            @PathVariable UUID cardId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(cardAssigneeService.listAssignees(cardId, user.id()));
    }

    @PostMapping("/{cardId}/assignees")
    public ResponseEntity<AssigneeResponse> add(
            @PathVariable UUID cardId,
            @Valid @RequestBody AddAssigneeRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cardAssigneeService.addAssignee(cardId, request.userId(), user.id()));
    }

    @DeleteMapping("/{cardId}/assignees/{userId}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID cardId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        cardAssigneeService.removeAssignee(cardId, userId, user.id());
        return ResponseEntity.noContent().build();
    }
}
