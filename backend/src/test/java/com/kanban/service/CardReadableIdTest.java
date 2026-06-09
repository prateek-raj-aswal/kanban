package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.repository.*;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** US-1607: CardService.createCard allocates readable_id via ReadableIdService. */
@ExtendWith(MockitoExtension.class)
class CardReadableIdTest {

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

    private final UUID workspaceId = UUID.randomUUID();

    @BeforeEach void setUp() {
        cardService = new CardService(cardRepository, columnRepository, labelRepository,
                subtaskRepository, commentRepository, cardAssigneeRepository, cardModuleRepository,
                accessPolicy, eventBroadcastService, activityLogService, notificationService,
                readableIdService);
    }

    private BoardColumn columnInBoardWithWorkspace(UUID wsId) {
        Board board = new Board();
        board.setWorkspaceId(wsId);
        BoardColumn col = new BoardColumn();
        col.setBoard(board);
        return col;
    }

    @Test void createCard_sets_readableId_from_ReadableIdService() {
        UUID colId = UUID.randomUUID();
        BoardColumn col = columnInBoardWithWorkspace(workspaceId);
        when(columnRepository.findActiveById(colId)).thenReturn(Optional.of(col));
        when(readableIdService.allocate(workspaceId, "STORY")).thenReturn("US-001");
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());

        CardResponse resp = cardService.createCard(colId, new CreateCardRequest("T", null, null, null, null), UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("US-001");
        verify(readableIdService).allocate(workspaceId, "STORY");
    }

    @Test void createCard_BUG_type_allocates_BUG_prefix() {
        UUID colId = UUID.randomUUID();
        BoardColumn col = columnInBoardWithWorkspace(workspaceId);
        when(columnRepository.findActiveById(colId)).thenReturn(Optional.of(col));
        when(readableIdService.allocate(workspaceId, "BUG")).thenReturn("BUG-042");
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());

        CardResponse resp = cardService.createCard(colId, new CreateCardRequest("T", null, null, null, "BUG"), UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("BUG-042");
    }

    @Test void createCard_allocates_from_board_workspace() {
        UUID colId = UUID.randomUUID();
        UUID otherWsId = UUID.randomUUID();
        BoardColumn col = columnInBoardWithWorkspace(otherWsId);
        when(columnRepository.findActiveById(colId)).thenReturn(Optional.of(col));
        when(readableIdService.allocate(otherWsId, "STORY")).thenReturn("US-007");
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(subtaskRepository.findByCardIdOrderByPositionAsc(any())).thenReturn(List.of());
        when(commentRepository.findByCardIdOrderByCreatedAtAsc(any())).thenReturn(List.of());
        when(cardAssigneeRepository.findByCardId(any())).thenReturn(List.of());
        when(cardModuleRepository.findByCard(any())).thenReturn(List.of());

        CardResponse resp = cardService.createCard(colId, new CreateCardRequest("T", null, null, null, null), UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("US-007");
        verify(readableIdService).allocate(otherWsId, "STORY");
    }
}
