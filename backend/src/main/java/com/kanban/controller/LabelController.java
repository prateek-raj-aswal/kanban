package com.kanban.controller;

import com.kanban.dto.request.CreateLabelRequest;
import com.kanban.dto.request.UpdateLabelRequest;
import com.kanban.dto.response.LabelResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.LabelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @PostMapping("/api/v1/boards/{boardId}/labels")
    @ResponseStatus(HttpStatus.CREATED)
    public LabelResponse createLabel(@PathVariable UUID boardId,
                                     @Valid @RequestBody CreateLabelRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser principal) {
        return labelService.createLabel(boardId, request, principal.id());
    }

    @GetMapping("/api/v1/boards/{boardId}/labels")
    public List<LabelResponse> getLabels(@PathVariable UUID boardId,
                                          @AuthenticationPrincipal AuthenticatedUser principal) {
        return labelService.getLabels(boardId, principal.id());
    }

    @PatchMapping("/api/v1/labels/{labelId}")
    public LabelResponse updateLabel(@PathVariable UUID labelId,
                                     @Valid @RequestBody UpdateLabelRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser principal) {
        return labelService.updateLabel(labelId, request, principal.id());
    }

    @DeleteMapping("/api/v1/labels/{labelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLabel(@PathVariable UUID labelId,
                            @AuthenticationPrincipal AuthenticatedUser principal) {
        labelService.deleteLabel(labelId, principal.id());
    }
}
