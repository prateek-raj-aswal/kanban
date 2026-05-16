package com.kanban.controller;

import com.kanban.dto.response.ActivityLogResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.service.ActivityLogService;
import com.kanban.service.CardService;
import com.kanban.repository.CardRepository;
import com.kanban.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final BoardAccessPolicy boardAccessPolicy;
    private final CardRepository cardRepository;

    public ActivityLogController(ActivityLogService activityLogService,
                                  BoardAccessPolicy boardAccessPolicy,
                                  CardRepository cardRepository) {
        this.activityLogService = activityLogService;
        this.boardAccessPolicy = boardAccessPolicy;
        this.cardRepository = cardRepository;
    }

    @GetMapping("/cards/{cardId}/activity")
    public List<ActivityLogResponse> cardActivity(@PathVariable UUID cardId,
                                                   @AuthenticationPrincipal AuthenticatedUser user) {
        var card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        boardAccessPolicy.assertMember(card.getColumn().getBoard().getId(), user.id());
        return activityLogService.getCardActivity(cardId);
    }

    @GetMapping("/boards/{boardId}/activity")
    public List<ActivityLogResponse> boardActivity(@PathVariable UUID boardId,
                                                    @AuthenticationPrincipal AuthenticatedUser user) {
        boardAccessPolicy.assertMember(boardId, user.id());
        return activityLogService.getBoardActivity(boardId);
    }
}
