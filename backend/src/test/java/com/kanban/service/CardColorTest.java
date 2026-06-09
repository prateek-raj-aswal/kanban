package com.kanban.service;

import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardColorTest {

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

    @InjectMocks CardService cardService;

    private UUID userId;
    private UUID boardId;
    private UUID columnId;
    private UUID cardId;
    private Card card;

    @BeforeEach
    void setUp() {
        userId   = UUID.randomUUID();
        boardId  = UUID.randomUUID();
        columnId = UUID.randomUUID();
        cardId   = UUID.randomUUID();

        Board board = new Board();
        setField(board, "id", boardId);

        BoardColumn column = new BoardColumn();
        setField(column, "id", columnId);
        setField(column, "board", board);
        setField(column, "name", "To Do");

        card = new Card();
        setField(card, "id", cardId);
        setField(card, "column", column);
        setField(card, "title", "Test card");
        setField(card, "position", 1000.0);
    }

    // TC-1: PATCH card with valid hex #ff0000 → color stored and returned
    @Test
    void updateCard_validHex_colorStoredAndReturned() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, "#ff0000", null);
        CardResponse res = cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        org.mockito.Mockito.verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getColor()).isEqualTo("#ff0000");
        assertThat(res.color()).isEqualTo("#ff0000");
    }

    // TC-2: PATCH card with null color → color cleared (null in response)
    @Test
    void updateCard_nullColor_colorClearedInResponse() {
        setField(card, "color", "#aabbcc");
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, null);
        CardResponse res = cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        org.mockito.Mockito.verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getColor()).isNull();
        assertThat(res.color()).isNull();
    }

    // TC-3: PATCH card with invalid hex "notahex" → ApiException 422
    @Test
    void updateCard_invalidHexString_throws422() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, "notahex", null);

        assertThatThrownBy(() -> cardService.updateCard(cardId, req, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // TC-4: PATCH card with invalid hex "#gggggg" (wrong chars) → 422
    @Test
    void updateCard_invalidHexChars_throws422() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, "#gggggg", null);

        assertThatThrownBy(() -> cardService.updateCard(cardId, req, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // TC-5: Card response includes color field (null when not set)
    @Test
    void getCard_colorFieldPresentInResponse_nullWhenNotSet() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        CardResponse res = cardService.getCard(cardId, userId);

        assertThat(res.color()).isNull();
    }

    @SuppressWarnings("unchecked")
    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
