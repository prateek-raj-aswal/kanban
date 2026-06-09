package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.model.Label;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.BoardAction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

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
    private Board board;
    private BoardColumn column;
    private Card card;

    @BeforeEach
    void setUp() {
        userId   = UUID.randomUUID();
        boardId  = UUID.randomUUID();
        columnId = UUID.randomUUID();
        cardId   = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);

        column = new BoardColumn();
        setField(column, "id", columnId);
        setField(column, "board", board);
        setField(column, "name", "To Do");

        card = new Card();
        setField(card, "id", cardId);
        setField(card, "column", column);
        setField(card, "title", "Test card");
        setField(card, "position", 1000.0);
    }

    @Test
    void createCard_savesCardWithCorrectFields() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(cardRepository.findMaxPositionByColumnId(columnId)).thenReturn(Optional.of(2000.0));
        when(cardRepository.save(any())).thenAnswer(inv -> {
            Card saved = inv.getArgument(0);
            setField(saved, "id", cardId);
            return saved;
        });

        CreateCardRequest req = new CreateCardRequest("New card", "A description", LocalDate.of(2026, 6, 1), null, null);
        CardResponse res = cardService.createCard(columnId, req, userId);

        assertThat(res.title()).isEqualTo("New card");
        assertThat(res.description()).isEqualTo("A description");
        assertThat(res.dueDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(res.position()).isEqualTo(3000.0);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("New card");
    }

    @Test
    void createCard_positionsAtStartWhenNoCardsExist() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(cardRepository.findMaxPositionByColumnId(columnId)).thenReturn(Optional.empty());
        when(cardRepository.save(any())).thenAnswer(inv -> {
            Card saved = inv.getArgument(0);
            setField(saved, "id", cardId);
            return saved;
        });

        CreateCardRequest req = new CreateCardRequest("First card", null, null, null, null);
        CardResponse res = cardService.createCard(columnId, req, userId);

        assertThat(res.position()).isEqualTo(1000.0);
    }

    @Test
    void createCard_throwsNotFoundWhenColumnMissing() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            cardService.createCard(columnId, new CreateCardRequest("X", null, null, null, null), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void getCard_returnsResponseForMember() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        CardResponse res = cardService.getCard(cardId, userId);

        assertThat(res.id()).isEqualTo(cardId);
        assertThat(res.title()).isEqualTo("Test card");
        verify(accessPolicy).assertMember(boardId, userId);
    }

    @Test
    void getCard_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.getCard(cardId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void updateCard_updatesTitle() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        UpdateCardRequest req = new UpdateCardRequest("Updated title", null, null, null, null, null, null, null);
        CardResponse res = cardService.updateCard(cardId, req, userId);

        assertThat(res.title()).isEqualTo("Updated title");
    }

    @Test
    void updateCard_clearsDescriptionWhenNullSent() {
        setField(card, "description", "old description");
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isNull();
    }

    @Test
    void updateCard_replacesLabelsWhenLabelIdsProvided() {
        UUID labelId = UUID.randomUUID();
        Label label = new Label();
        setField(label, "id", labelId);
        setField(label, "name", "Bug");
        setField(label, "color", "#dc2626");

        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(labelRepository.findAllById(List.of(labelId))).thenReturn(List.of(label));
        when(cardRepository.save(any())).thenReturn(card);

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, List.of(labelId), null, null);
        CardResponse res = cardService.updateCard(cardId, req, userId);

        assertThat(res.labels()).hasSize(1);
        assertThat(res.labels().get(0).name()).isEqualTo("Bug");
    }

    @Test
    void updateCard_doesNotTouchLabelsWhenLabelIdsIsNull() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        UpdateCardRequest req = new UpdateCardRequest("New title", null, null, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        verify(labelRepository, never()).findAllById(any());
    }

    @Test
    void updateCard_setsStartDateWhenProvided() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        LocalDate start = LocalDate.of(2026, 6, 1);
        UpdateCardRequest req = new UpdateCardRequest(null, null, start, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isEqualTo(start);
    }

    @Test
    void updateCard_clearsStartDateWhenNull() {
        setField(card, "startDate", LocalDate.of(2026, 1, 1));
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isNull();
    }

    @Test
    void deleteCard_setsDeletedAt() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        cardService.deleteCard(cardId, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getDeletedAt()).isNotNull();
    }

    @Test
    void deleteCard_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.deleteCard(cardId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // ── moveCard ──────────────────────────────────────────────────────────────

    @Test
    void moveCard_movesCardToSameColumnWithNewPosition() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CardResponse res = cardService.moveCard(cardId, columnId, 500.0, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getPosition()).isEqualTo(500.0);
        assertThat(captor.getValue().getColumn()).isSameAs(column);
        assertThat(res.columnId()).isEqualTo(columnId);
    }

    @Test
    void moveCard_movesCardToDifferentColumnOnSameBoard() {
        UUID targetColumnId = UUID.randomUUID();
        BoardColumn targetColumn = new BoardColumn();
        setField(targetColumn, "id", targetColumnId);
        setField(targetColumn, "board", board);
        setField(targetColumn, "name", "In Progress");

        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(targetColumnId)).thenReturn(Optional.of(targetColumn));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CardResponse res = cardService.moveCard(cardId, targetColumnId, 2000.0, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getColumn()).isSameAs(targetColumn);
        assertThat(captor.getValue().getPosition()).isEqualTo(2000.0);
        assertThat(res.columnId()).isEqualTo(targetColumnId);
    }

    @Test
    void moveCard_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.moveCard(cardId, columnId, 1000.0, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void moveCard_throwsNotFoundWhenTargetColumnMissing() {
        UUID unknownColumnId = UUID.randomUUID();
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(unknownColumnId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.moveCard(cardId, unknownColumnId, 1000.0, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void moveCard_throwsUnprocessableWhenTargetColumnOnDifferentBoard() {
        UUID otherBoardId = UUID.randomUUID();
        Board otherBoard = new Board();
        setField(otherBoard, "id", otherBoardId);

        UUID targetColumnId = UUID.randomUUID();
        BoardColumn foreignColumn = new BoardColumn();
        setField(foreignColumn, "id", targetColumnId);
        setField(foreignColumn, "board", otherBoard);

        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(targetColumnId)).thenReturn(Optional.of(foreignColumn));

        assertThatThrownBy(() -> cardService.moveCard(cardId, targetColumnId, 1000.0, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    void moveCard_checksMembershipOnSourceBoard() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cardService.moveCard(cardId, columnId, 1000.0, userId);

        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    // Helper: set private fields on models that lack setters for them
    @SuppressWarnings("unchecked")
    private static <T> void setField(Object obj, String field, Object value) {
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
