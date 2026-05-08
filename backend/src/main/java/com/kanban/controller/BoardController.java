package com.kanban.controller;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.dto.response.MemberResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping
    public ResponseEntity<BoardResponse> create(
            @Valid @RequestBody CreateBoardRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.createBoard(request, user.id()));
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(boardService.getBoardsForUser(user.id()));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> get(@PathVariable UUID boardId,
                                             @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(boardService.getBoardById(boardId, user.id()));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> delete(@PathVariable UUID boardId,
                                       @AuthenticationPrincipal AuthenticatedUser user) {
        boardService.deleteBoard(boardId, user.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{boardId}/members")
    public ResponseEntity<List<MemberResponse>> members(@PathVariable UUID boardId,
                                                        @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(boardService.getMembers(boardId, user.id()));
    }
}
