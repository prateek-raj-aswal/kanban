package com.kanban.controller;

import com.kanban.dto.request.AddWorkspaceMemberRequest;
import com.kanban.dto.request.CreateWorkspaceRequest;
import com.kanban.dto.request.UpdateWorkspaceRequest;
import com.kanban.dto.response.WorkspaceMemberResponse;
import com.kanban.dto.response.WorkspaceResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.security.Role;
import com.kanban.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Valid @RequestBody CreateWorkspaceRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workspaceService.createWorkspace(req, user.id()));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(workspaceService.listWorkspaces(user.id()));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> get(@PathVariable UUID workspaceId,
                                                 @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId, user.id()));
    }

    @PatchMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> update(@PathVariable UUID workspaceId,
                                                    @Valid @RequestBody UpdateWorkspaceRequest req,
                                                    @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, req, user.id()));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(@PathVariable UUID workspaceId,
                                       @AuthenticationPrincipal AuthenticatedUser user) {
        workspaceService.deleteWorkspace(workspaceId, user.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> listMembers(@PathVariable UUID workspaceId,
                                                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(workspaceService.listMembers(workspaceId, user.id()));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMemberResponse> addMember(@PathVariable UUID workspaceId,
                                                             @Valid @RequestBody AddWorkspaceMemberRequest req,
                                                             @AuthenticationPrincipal AuthenticatedUser user) {
        WorkspaceMemberResponse member = workspaceService.addMember(workspaceId, req, user.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @PatchMapping("/{workspaceId}/members/{userId}/role")
    public ResponseEntity<Void> updateMemberRole(@PathVariable UUID workspaceId,
                                                 @PathVariable UUID userId,
                                                 @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal AuthenticatedUser user) {
        Role newRole = Role.valueOf(body.get("role"));
        workspaceService.updateMemberRole(workspaceId, user.id(), userId, newRole);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID workspaceId,
                                             @PathVariable UUID userId,
                                             @AuthenticationPrincipal AuthenticatedUser user) {
        workspaceService.removeMember(workspaceId, userId, user.id());
        return ResponseEntity.noContent().build();
    }
}
