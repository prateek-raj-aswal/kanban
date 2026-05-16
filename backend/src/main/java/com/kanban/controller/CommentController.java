package com.kanban.controller;

import com.kanban.dto.request.CreateCommentRequest;
import com.kanban.dto.request.UpdateCommentRequest;
import com.kanban.dto.response.CommentResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/cards/{cardId}/comments")
    public List<CommentResponse> list(@PathVariable UUID cardId,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        return commentService.listComments(cardId, user.id());
    }

    @PostMapping("/cards/{cardId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(@PathVariable UUID cardId,
                                  @Valid @RequestBody CreateCommentRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser user) {
        return commentService.createComment(cardId, request, user.id());
    }

    @PatchMapping("/comments/{commentId}")
    public CommentResponse update(@PathVariable UUID commentId,
                                  @Valid @RequestBody UpdateCommentRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser user) {
        return commentService.updateComment(commentId, request, user.id());
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID commentId,
                       @AuthenticationPrincipal AuthenticatedUser user) {
        commentService.deleteComment(commentId, user.id());
    }
}
