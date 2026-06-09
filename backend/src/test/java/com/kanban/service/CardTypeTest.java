package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.repository.*;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** US-1606: Card type field — defaults, updates, invalid-type rejection. */
@ExtendWith(MockitoExtension.class)
class CardTypeTest {

    @Mock CardRepository cardRepository;
    @Mock ColumnRepository columnRepository;
    @Mock LabelRepository labelRepository;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock CardModuleRepository cardModuleRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock EventBroadcastService eventBroadcastService;
    @Mock ActivityLogService activityLogService;
    @Mock NotificationService notificationService;
    @Mock ReadableIdService readableIdService;

    CardService cardService;

    @BeforeEach void setUp() {
        cardService = new CardService(cardRepository, columnRepository, labelRepository,
                subtaskRepository, commentRepository, cardAssigneeRepository, cardModuleRepository,
                accessPolicy, eventBroadcastService, activityLogService, notificationService,
                readableIdService);
    }

    private BoardColumn columnInBoard() {
        Board board = new Board();
        BoardColumn col = new BoardColumn();
        col.setBoard(board);
        return col;
    }

    private Card savedCard(String type, String readableId) {
        Card card = new Card();
        card.setTitle("T");
        card.setType(type);
        card.setReadableId(readableId);
        card.setColumn(columnInBoard());
        // labels is initialized internally, no setter needed
        when(cardRepository.save(any())).thenReturn(card);
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());
        return card;
    }

    @Test void create_card_without_type_defaults_to_STORY() {
        UUID colId = UUID.randomUUID();
        when(columnRepository.findActiveById(colId))
                .thenReturn(Optional.of(columnInBoard()));
        savedCard("STORY", "US-001");

        CreateCardRequest req = new CreateCardRequest("Title", null, null, null, null);
        CardResponse resp = cardService.createCard(colId, req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("STORY");
    }

    @Test void create_card_with_BUG_type_persists_BUG() {
        UUID colId = UUID.randomUUID();
        when(columnRepository.findActiveById(colId))
                .thenReturn(Optional.of(columnInBoard()));
        savedCard("BUG", "BUG-001");

        CreateCardRequest req = new CreateCardRequest("Title", null, null, null, "BUG");
        CardResponse resp = cardService.createCard(colId, req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("BUG");
    }

    @Test void create_card_with_invalid_type_throws_422() {
        UUID colId = UUID.randomUUID();
        when(columnRepository.findActiveById(colId))
                .thenReturn(Optional.of(columnInBoard()));

        CreateCardRequest req = new CreateCardRequest("Title", null, null, null, "INVALID");
        assertThatThrownBy(() -> cardService.createCard(colId, req, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
    }

    @Test void card_response_includes_readable_id() {
        UUID colId = UUID.randomUUID();
        when(columnRepository.findActiveById(colId))
                .thenReturn(Optional.of(columnInBoard()));
        savedCard("STORY", "US-042");

        CreateCardRequest req = new CreateCardRequest("Title", null, null, null, null);
        CardResponse resp = cardService.createCard(colId, req, UUID.randomUUID());
        assertThat(resp.readableId()).isEqualTo("US-042");
    }

    @Test void update_card_with_null_type_does_not_change_type() {
        Card existing = new Card();
        existing.setTitle("T");
        existing.setType("STORY");
        existing.setReadableId("US-001");
        existing.setColumn(columnInBoard());
        // labels initialized internally
        when(cardRepository.findActiveById(any())).thenReturn(Optional.of(existing));
        when(cardRepository.save(any())).thenReturn(existing);
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, null);
        CardResponse resp = cardService.updateCard(UUID.randomUUID(), req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("STORY");
    }

    @Test void update_card_with_FEATURE_type_changes_type() {
        Card existing = new Card();
        existing.setTitle("T");
        existing.setType("STORY");
        existing.setReadableId("US-001");
        existing.setColumn(columnInBoard());
        // labels initialized internally
        when(cardRepository.findActiveById(any())).thenReturn(Optional.of(existing));
        when(cardRepository.save(any())).thenAnswer(inv -> {
            Card c = inv.getArgument(0);
            return c;
        });
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, "FEATURE");
        CardResponse resp = cardService.updateCard(UUID.randomUUID(), req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("FEATURE");
    }

    @Test void update_card_with_invalid_type_throws_422() {
        Card existing = new Card();
        existing.setTitle("T");
        existing.setType("STORY");
        existing.setColumn(columnInBoard());
        // labels initialized internally
        when(cardRepository.findActiveById(any())).thenReturn(Optional.of(existing));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, "INVALID");
        assertThatThrownBy(() -> cardService.updateCard(UUID.randomUUID(), req, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
    }
}
