package com.kanban.controller;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.MoveCardRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/api/v1/columns/{columnId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable UUID columnId,
                                   @Valid @RequestBody CreateCardRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser principal) {
        return cardService.createCard(columnId, request, principal.id());
    }

    @GetMapping("/api/v1/cards/{cardId}")
    public CardResponse getCard(@PathVariable UUID cardId,
                                @AuthenticationPrincipal AuthenticatedUser principal) {
        return cardService.getCard(cardId, principal.id());
    }

    @PatchMapping("/api/v1/cards/{cardId}")
    public CardResponse updateCard(@PathVariable UUID cardId,
                                   @RequestBody UpdateCardRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser principal) {
        return cardService.updateCard(cardId, request, principal.id());
    }

    @PatchMapping("/api/v1/cards/{cardId}/move")
    public CardResponse moveCard(@PathVariable UUID cardId,
                                 @Valid @RequestBody MoveCardRequest request,
                                 @AuthenticationPrincipal AuthenticatedUser principal) {
        return cardService.moveCard(cardId, request.targetColumnId(), request.position(), principal.id());
    }

    @DeleteMapping("/api/v1/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable UUID cardId,
                           @AuthenticationPrincipal AuthenticatedUser principal) {
        cardService.deleteCard(cardId, principal.id());
    }
}
