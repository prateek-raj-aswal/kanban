package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.CreateColumnRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.websocket.BoardEventPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BroadcastTest {

    @Mock CardRepository cardRepository;
    @Mock ColumnRepository columnRepository;
    @Mock LabelRepository labelRepository;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock BoardRepository boardRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock EventBroadcastService eventBroadcastService;
    @Mock ActivityLogService activityLogService;
    @Mock NotificationService notificationService;

    private CardService cardService;
    private ColumnService columnService;

    private UUID userId;
    private UUID boardId;
    private UUID columnId;
    private UUID cardId;
    private Board board;
    private BoardColumn column;
    private Card card;

    @BeforeEach
    void setUp() {
        cardService = new CardService(cardRepository, columnRepository, labelRepository,
                subtaskRepository, commentRepository, cardAssigneeRepository, accessPolicy,
                eventBroadcastService, activityLogService, notificationService);
        columnService = new ColumnService(columnRepository, boardRepository,
                accessPolicy, eventBroadcastService);

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

    // ── Card broadcasts ──────────────────────────────────────────────────────

    @Test
    void createCard_broadcastsCardCreated() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(cardRepository.findMaxPositionByColumnId(columnId)).thenReturn(Optional.empty());
        when(cardRepository.save(any())).thenAnswer(inv -> {
            Card c = inv.getArgument(0);
            setField(c, "id", cardId);
            return c;
        });

        cardService.createCard(columnId, new CreateCardRequest("Title", null, null, null), userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("CARD_CREATED");
        assertThat(captor.getValue().boardId()).isEqualTo(boardId);
        var data = (BoardEventPayload.CardCreatedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(cardId);
        assertThat(data.columnId()).isEqualTo(columnId);
    }

    @Test
    void updateCard_broadcastsCardUpdated() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenReturn(card);

        cardService.updateCard(cardId, new UpdateCardRequest("New title", null, null, null, null, null), userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("CARD_UPDATED");
        var data = (BoardEventPayload.CardUpdatedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(cardId);
    }

    @Test
    void moveCard_broadcastsCardMovedWithFromColumnId() {
        UUID targetColumnId = UUID.randomUUID();
        BoardColumn targetColumn = new BoardColumn();
        setField(targetColumn, "id", targetColumnId);
        setField(targetColumn, "board", board);

        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(columnRepository.findActiveById(targetColumnId)).thenReturn(Optional.of(targetColumn));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cardService.moveCard(cardId, targetColumnId, 500.0, userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("CARD_MOVED");
        var data = (BoardEventPayload.CardMovedData) captor.getValue().data();
        assertThat(data.fromColumnId()).isEqualTo(columnId);
        assertThat(data.toColumnId()).isEqualTo(targetColumnId);
        assertThat(data.newPosition()).isEqualTo(500.0);
    }

    @Test
    void deleteCard_broadcastsCardDeleted() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        cardService.deleteCard(cardId, userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("CARD_DELETED");
        var data = (BoardEventPayload.CardDeletedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(cardId);
        assertThat(data.columnId()).isEqualTo(columnId);
    }

    // ── Column broadcasts ────────────────────────────────────────────────────

    @Test
    void createColumn_broadcastsColumnCreated() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(columnRepository.findMaxPositionByBoardId(boardId)).thenReturn(Optional.empty());
        when(columnRepository.save(any())).thenAnswer(inv -> {
            BoardColumn c = inv.getArgument(0);
            setField(c, "id", columnId);
            return c;
        });

        columnService.createColumn(boardId, new CreateColumnRequest("Done"), userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("COLUMN_CREATED");
        var data = (BoardEventPayload.ColumnCreatedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(columnId);
        assertThat(data.name()).isEqualTo("Done");
    }

    @Test
    void renameColumn_broadcastsColumnUpdated() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));
        when(columnRepository.save(any())).thenReturn(column);

        columnService.renameColumn(columnId, "Renamed", userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("COLUMN_UPDATED");
        var data = (BoardEventPayload.ColumnUpdatedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(columnId);
        assertThat(data.name()).isEqualTo("Renamed");
    }

    @Test
    void deleteColumn_broadcastsColumnDeleted() {
        when(columnRepository.findActiveById(columnId)).thenReturn(Optional.of(column));

        columnService.deleteColumn(columnId, userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("COLUMN_DELETED");
        var data = (BoardEventPayload.ColumnDeletedData) captor.getValue().data();
        assertThat(data.id()).isEqualTo(columnId);
    }

    @Test
    void reorderColumns_broadcastsColumnReordered() {
        UUID col2Id = UUID.randomUUID();
        BoardColumn col2 = new BoardColumn();
        setField(col2, "id", col2Id);
        setField(col2, "board", board);
        setField(col2, "name", "In Progress");
        setField(col2, "position", 2000.0);

        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(columnRepository.findActiveByBoardId(boardId))
                .thenReturn(List.of(column, col2))
                .thenReturn(List.of(column, col2));
        when(columnRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        columnService.reorderColumns(boardId, List.of(col2Id, columnId), userId);

        ArgumentCaptor<BoardEventPayload> captor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(eventBroadcastService).broadcastBoardEvent(eq(boardId), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("COLUMN_REORDERED");
        var data = (BoardEventPayload.ColumnReorderedData) captor.getValue().data();
        assertThat(data.columns()).hasSize(2);
    }

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
