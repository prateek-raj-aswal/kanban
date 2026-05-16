package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.MoveCardRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.dto.response.LabelResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.model.Label;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.websocket.BoardEventPayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;
    private final LabelRepository labelRepository;
    private final SubtaskRepository subtaskRepository;
    private final CommentRepository commentRepository;
    private final BoardAccessPolicy accessPolicy;
    private final EventBroadcastService eventBroadcastService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public CardService(CardRepository cardRepository, ColumnRepository columnRepository,
                       LabelRepository labelRepository, SubtaskRepository subtaskRepository,
                       CommentRepository commentRepository, BoardAccessPolicy accessPolicy,
                       EventBroadcastService eventBroadcastService, ActivityLogService activityLogService,
                       NotificationService notificationService) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.labelRepository = labelRepository;
        this.subtaskRepository = subtaskRepository;
        this.commentRepository = commentRepository;
        this.accessPolicy = accessPolicy;
        this.eventBroadcastService = eventBroadcastService;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public CardResponse createCard(UUID columnId, CreateCardRequest request, UUID requestingUserId) {
        BoardColumn column = columnRepository.findActiveById(columnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COLUMN_NOT_FOUND", "Column not found"));
        accessPolicy.assertMember(column.getBoard().getId(), requestingUserId);

        double maxPos = cardRepository.findMaxPositionByColumnId(columnId).orElse(0.0);
        Card card = new Card();
        card.setColumn(column);
        card.setTitle(request.title());
        card.setDescription(request.description());
        card.setDueDate(request.dueDate());
        card.setAssigneeId(request.assigneeId());
        if (request.priority() != null) card.setPriority(request.priority());
        card.setPosition(maxPos + 1000.0);
        card = cardRepository.save(card);

        UUID boardId = column.getBoard().getId();
        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("CARD_CREATED", boardId,
                new BoardEventPayload.CardCreatedData(
                        card.getId(), columnId, card.getTitle(), card.getPosition(),
                        card.getAssigneeId(), card.getDueDate(), card.getPriority(), List.of())));
        activityLogService.record(boardId, card.getId(), requestingUserId, "CARD_CREATED",
                "Card \"" + card.getTitle() + "\" created");

        return toResponse(card);
    }

    @Transactional(readOnly = true)
    public CardResponse getCard(UUID cardId, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);
        return toResponse(card);
    }

    @Transactional
    public CardResponse updateCard(UUID cardId, UpdateCardRequest request, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        UUID previousAssigneeId = card.getAssigneeId();
        if (request.title() != null && !request.title().isBlank()) {
            card.setTitle(request.title());
        }
        card.setDescription(request.description());
        card.setDueDate(request.dueDate());
        card.setAssigneeId(request.assigneeId());
        if (request.priority() != null) card.setPriority(request.priority());

        if (request.labelIds() != null) {
            List<Label> labels = labelRepository.findAllById(request.labelIds());
            card.getLabels().clear();
            card.getLabels().addAll(labels);
        }

        card = cardRepository.save(card);

        UUID boardId = card.getColumn().getBoard().getId();
        CardResponse response = toResponse(card);
        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("CARD_UPDATED", boardId,
                new BoardEventPayload.CardUpdatedData(
                        card.getId(), card.getColumn().getId(), card.getTitle(), card.getDescription(),
                        card.getAssigneeId(), card.getDueDate(), card.getPriority(), response.labels(), card.getUpdatedAt())));
        activityLogService.record(boardId, card.getId(), requestingUserId, "CARD_UPDATED",
                "Card \"" + card.getTitle() + "\" updated");

        UUID newAssigneeId = card.getAssigneeId();
        if (newAssigneeId != null && !newAssigneeId.equals(previousAssigneeId)
                && !newAssigneeId.equals(requestingUserId)) {
            notificationService.notifyAssignment(newAssigneeId, card.getId(), boardId, card.getTitle());
        }

        return response;
    }

    @Transactional
    public CardResponse moveCard(UUID cardId, UUID targetColumnId, double position, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));

        BoardColumn targetColumn = columnRepository.findActiveById(targetColumnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COLUMN_NOT_FOUND", "Column not found"));

        if (!targetColumn.getBoard().getId().equals(card.getColumn().getBoard().getId())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                    "Target column belongs to a different board");
        }

        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        UUID fromColumnId = card.getColumn().getId();
        UUID boardId = card.getColumn().getBoard().getId();

        card.setColumn(targetColumn);
        card.setPosition(position);
        card = cardRepository.save(card);

        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("CARD_MOVED", boardId,
                new BoardEventPayload.CardMovedData(
                        card.getId(), fromColumnId, targetColumnId, position, card.getUpdatedAt())));
        activityLogService.record(boardId, card.getId(), requestingUserId, "CARD_MOVED",
                "Card \"" + card.getTitle() + "\" moved");

        return toResponse(card);
    }

    @Transactional
    public void deleteCard(UUID cardId, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        UUID boardId = card.getColumn().getBoard().getId();
        UUID columnId = card.getColumn().getId();

        String cardTitle = card.getTitle();
        card.setDeletedAt(Instant.now());
        cardRepository.save(card);

        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("CARD_DELETED", boardId,
                new BoardEventPayload.CardDeletedData(cardId, columnId)));
        activityLogService.record(boardId, cardId, requestingUserId, "CARD_DELETED",
                "Card \"" + cardTitle + "\" deleted");
    }

    private CardResponse toResponse(Card card) {
        List<LabelResponse> labels = card.getLabels().stream()
                .map(l -> new LabelResponse(l.getId(), l.getName(), l.getColor()))
                .toList();
        List<com.kanban.model.Subtask> subtasks = subtaskRepository.findByCardIdOrderByPositionAsc(card.getId());
        int subtaskTotal = subtasks.size();
        int subtaskDone = (int) subtasks.stream().filter(com.kanban.model.Subtask::isCompleted).count();
        int commentCount = (int) commentRepository.findByCardIdOrderByCreatedAtAsc(card.getId()).size();
        return new CardResponse(card.getId(), card.getColumn().getId(),
                card.getTitle(), card.getDescription(), card.getPosition(),
                card.getAssigneeId(), card.getDueDate(), card.getPriority(), labels,
                subtaskTotal, subtaskDone, commentCount,
                card.getCreatedAt(), card.getUpdatedAt());
    }
}
