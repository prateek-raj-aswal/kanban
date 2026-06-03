package com.kanban.controller;

import com.kanban.dto.request.CreateIssueRequest;
import com.kanban.dto.request.UpdateIssueRequest;
import com.kanban.dto.response.IssueResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping("/api/v1/issues")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueResponse createIssue(@Valid @RequestBody CreateIssueRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser principal) {
        return issueService.createIssue(request, principal.id());
    }

    @GetMapping("/api/v1/issues")
    public List<IssueResponse> listIssues(
            @RequestParam(required = false) UUID parentCardId) {
        return issueService.listIssues(Optional.ofNullable(parentCardId));
    }

    @GetMapping("/api/v1/issues/{issueId}")
    public IssueResponse getIssue(@PathVariable UUID issueId) {
        return issueService.getIssue(issueId);
    }

    @PatchMapping("/api/v1/issues/{issueId}")
    public IssueResponse updateIssue(@PathVariable UUID issueId,
                                     @RequestBody UpdateIssueRequest request) {
        return issueService.updateIssue(issueId, request);
    }

    @DeleteMapping("/api/v1/issues/{issueId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(@PathVariable UUID issueId) {
        issueService.deleteIssue(issueId);
    }
}
