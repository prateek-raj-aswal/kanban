package com.kanban.controller;

import com.kanban.dto.response.TimelineCardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.security.AuthenticatedUser;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class TimelineController {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final CardAssigneeRepository cardAssigneeRepository;
    private final BoardAccessPolicy accessPolicy;

    public TimelineController(BoardRepository boardRepository,
                              CardRepository cardRepository,
                              CardAssigneeRepository cardAssigneeRepository,
                              BoardAccessPolicy accessPolicy) {
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
        this.cardAssigneeRepository = cardAssigneeRepository;
        this.accessPolicy = accessPolicy;
    }

    @GetMapping("/api/v1/boards/{boardId}/timeline")
    public List<TimelineCardResponse> getTimeline(@PathVariable UUID boardId,
                                                   @AuthenticationPrincipal AuthenticatedUser principal) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, principal.id());

        List<Card> cards = cardRepository.findTimelineCards(boardId);
        if (cards.isEmpty()) return List.of();

        List<UUID> cardIds = cards.stream().map(Card::getId).toList();
        Map<UUID, List<UUID>> assigneeMap = cardAssigneeRepository.findByCardIdIn(cardIds).stream()
                .collect(Collectors.groupingBy(
                        ca -> ca.getCardId(),
                        Collectors.mapping(ca -> ca.getUserId(), Collectors.toList())));

        return cards.stream()
                .map(c -> new TimelineCardResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getColumn().getName(),
                        c.getStartDate(),
                        c.getDueDate(),
                        c.getPriority(),
                        assigneeMap.getOrDefault(c.getId(), List.of())))
                .toList();
    }
}
