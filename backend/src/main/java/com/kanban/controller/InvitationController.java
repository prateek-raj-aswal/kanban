package com.kanban.controller;

import com.kanban.dto.request.AcceptInvitationRequest;
import com.kanban.dto.request.CreateInvitationRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.dto.response.InvitationResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/api/v1/boards/{boardId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse create(@PathVariable UUID boardId,
                                     @Valid @RequestBody CreateInvitationRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser principal) {
        return invitationService.createInvitation(boardId, request, principal.id());
    }

    @PostMapping("/api/v1/invitations/accept")
    public BoardResponse accept(@Valid @RequestBody AcceptInvitationRequest request,
                                @AuthenticationPrincipal AuthenticatedUser principal) {
        return invitationService.acceptInvitation(request.token(), principal.id());
    }
}
