package com.kanban.controller;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.dto.response.CardResponse;
import com.kanban.dto.response.LabelResponse;
import com.kanban.dto.response.MemberResponse;
import com.kanban.model.Card;
import com.kanban.model.CardAssignee;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.AuthenticatedUser;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.Role;
import com.kanban.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/boards")
public class BoardController {

    private final BoardService boardService;
    private final CardRepository cardRepository;
    private final LabelRepository labelRepository;
    private final SubtaskRepository subtaskRepository;
    private final CommentRepository commentRepository;
    private final CardAssigneeRepository cardAssigneeRepository;
    private final BoardAccessPolicy boardAccessPolicy;

    public BoardController(BoardService boardService, CardRepository cardRepository,
                            LabelRepository labelRepository, SubtaskRepository subtaskRepository,
                            CommentRepository commentRepository,
                            CardAssigneeRepository cardAssigneeRepository,
                            BoardAccessPolicy boardAccessPolicy) {
        this.boardService = boardService;
        this.cardRepository = cardRepository;
        this.labelRepository = labelRepository;
        this.subtaskRepository = subtaskRepository;
        this.commentRepository = commentRepository;
        this.cardAssigneeRepository = cardAssigneeRepository;
        this.boardAccessPolicy = boardAccessPolicy;
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

    @PatchMapping("/{boardId}")
    public ResponseEntity<BoardResponse> update(@PathVariable UUID boardId,
                                                @Valid @RequestBody UpdateBoardRequest request,
                                                @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(boardService.updateBoard(boardId, request, user.id()));
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

    @PatchMapping("/{boardId}/members/{userId}/role")
    public ResponseEntity<Void> updateMemberRole(@PathVariable UUID boardId,
                                                 @PathVariable UUID userId,
                                                 @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal AuthenticatedUser user) {
        Role newRole = Role.valueOf(body.get("role"));
        boardService.updateBoardMemberRole(boardId, user.id(), userId, newRole);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{boardId}/cards/search")
    public ResponseEntity<List<CardResponse>> searchCards(
            @PathVariable UUID boardId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) String priority,
            @AuthenticationPrincipal AuthenticatedUser user) {
        boardAccessPolicy.assertMember(boardId, user.id());
        List<Card> cards = cardRepository.searchCards(boardId,
                q != null && !q.isBlank() ? q : null, assigneeId, priority);
        List<UUID> cardIds = cards.stream().map(Card::getId).collect(Collectors.toList());
        Map<UUID, int[]> subtaskCounts = cardIds.isEmpty() ? Map.of()
                : subtaskRepository.getCountsByCardIds(cardIds);
        Map<UUID, Integer> commentCounts = cardIds.isEmpty() ? Map.of()
                : commentRepository.getCountsByCardIds(cardIds);
        Map<UUID, List<UUID>> assigneeMap = cardIds.isEmpty() ? Map.of()
                : cardAssigneeRepository.findByCardIdIn(cardIds).stream()
                    .collect(Collectors.groupingBy(CardAssignee::getCardId,
                             Collectors.mapping(CardAssignee::getUserId, Collectors.toList())));
        return ResponseEntity.ok(cards.stream().map(c -> {
            int[] sc = subtaskCounts.getOrDefault(c.getId(), new int[]{0, 0});
            int cc = commentCounts.getOrDefault(c.getId(), 0);
            List<LabelResponse> labels = c.getLabels().stream()
                    .map(l -> new LabelResponse(l.getId(), l.getName(), l.getColor())).toList();
            List<UUID> assignees = assigneeMap.getOrDefault(c.getId(), List.of());
            return new CardResponse(c.getId(), c.getColumn().getId(), c.getTitle(), c.getDescription(),
                    c.getPosition(), c.getStartDate(), c.getDueDate(), c.getPriority(),
                    labels, assignees, sc[0], sc[1], cc, c.getCreatedAt(), c.getUpdatedAt(), c.getColor(),
                    List.of(), c.getType(), c.getReadableId());
        }).toList());
    }
}
