package com.kanban.controller;

import com.kanban.dto.request.CreateSubtaskRequest;
import com.kanban.dto.request.UpdateSubtaskRequest;
import com.kanban.dto.response.SubtaskResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.SubtaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SubtaskController {

    private final SubtaskService subtaskService;

    public SubtaskController(SubtaskService subtaskService) {
        this.subtaskService = subtaskService;
    }

    @GetMapping("/cards/{cardId}/subtasks")
    public List<SubtaskResponse> list(@PathVariable UUID cardId,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return subtaskService.listSubtasks(cardId, user.id());
    }

    @PostMapping("/cards/{cardId}/subtasks")
    @ResponseStatus(HttpStatus.CREATED)
    public SubtaskResponse create(@PathVariable UUID cardId,
                                  @Valid @RequestBody CreateSubtaskRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser user) {
        return subtaskService.createSubtask(cardId, request, user.id());
    }

    @PatchMapping("/subtasks/{subtaskId}")
    public SubtaskResponse update(@PathVariable UUID subtaskId,
                                  @RequestBody UpdateSubtaskRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser user) {
        return subtaskService.updateSubtask(subtaskId, request, user.id());
    }

    @DeleteMapping("/subtasks/{subtaskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID subtaskId,
                       @AuthenticationPrincipal AuthenticatedUser user) {
        subtaskService.deleteSubtask(subtaskId, user.id());
    }
}
