package com.kanban.controller;

import com.kanban.dto.response.BoardResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.BoardStarService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class BoardStarController {

    private final BoardStarService boardStarService;

    public BoardStarController(BoardStarService boardStarService) {
        this.boardStarService = boardStarService;
    }

    @PostMapping("/api/v1/boards/{boardId}/star")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void star(@PathVariable UUID boardId,
                     @AuthenticationPrincipal AuthenticatedUser principal) {
        boardStarService.starBoard(boardId, principal.id());
    }

    @DeleteMapping("/api/v1/boards/{boardId}/star")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unstar(@PathVariable UUID boardId,
                       @AuthenticationPrincipal AuthenticatedUser principal) {
        boardStarService.unstarBoard(boardId, principal.id());
    }

    @GetMapping("/api/v1/me/starred-boards")
    public List<BoardResponse> starredBoards(@AuthenticationPrincipal AuthenticatedUser principal) {
        return boardStarService.getStarredBoards(principal.id());
    }
}
