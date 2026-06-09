package com.kanban.service;

import com.kanban.dto.request.CreateCardRequest;
import com.kanban.dto.request.MoveCardRequest;
import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.dto.response.LabelResponse;
import com.kanban.dto.response.ModuleResponse;
import com.kanban.exception.ApiException;
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
import com.kanban.websocket.BoardEventPayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CardService {

    private static final Set<String> VALID_TYPES = Set.of("STORY", "FEATURE", "BUG");

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;
    private final LabelRepository labelRepository;
    private final SubtaskRepository subtaskRepository;
    private final CommentRepository commentRepository;
    private final CardAssigneeRepository cardAssigneeRepository;
    private final CardModuleRepository cardModuleRepository;
    private final BoardAccessPolicy accessPolicy;
    private final EventBroadcastService eventBroadcastService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final ReadableIdService readableIdService;

    public CardService(CardRepository cardRepository, ColumnRepository columnRepository,
                       LabelRepository labelRepository, SubtaskRepository subtaskRepository,
                       CommentRepository commentRepository, CardAssigneeRepository cardAssigneeRepository,
                       CardModuleRepository cardModuleRepository,
                       BoardAccessPolicy accessPolicy, EventBroadcastService eventBroadcastService,
                       ActivityLogService activityLogService, NotificationService notificationService,
                       ReadableIdService readableIdService) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.labelRepository = labelRepository;
        this.subtaskRepository = subtaskRepository;
        this.commentRepository = commentRepository;
        this.cardAssigneeRepository = cardAssigneeRepository;
        this.cardModuleRepository = cardModuleRepository;
        this.accessPolicy = accessPolicy;
        this.eventBroadcastService = eventBroadcastService;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
        this.readableIdService = readableIdService;
    }

    @Transactional
    public CardResponse createCard(UUID columnId, CreateCardRequest request, UUID requestingUserId) {
        BoardColumn column = columnRepository.findActiveById(columnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COLUMN_NOT_FOUND", "Column not found"));
        accessPolicy.assertAccess(column.getBoard().getId(), requestingUserId, BoardAction.WRITE);

        String cardType = request.type() != null ? request.type() : "STORY";
        if (!VALID_TYPES.contains(cardType)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_TYPE",
                    "type must be one of: STORY, FEATURE, BUG");
        }

        double maxPos = cardRepository.findMaxPositionByColumnId(columnId).orElse(0.0);
        Card card = new Card();
        card.setColumn(column);
        card.setTitle(request.title());
        card.setDescription(request.description());
        card.setDueDate(request.dueDate());
        if (request.priority() != null) card.setPriority(request.priority());
        card.setType(cardType);
        card.setPosition(maxPos + 1000.0);

        UUID workspaceId = column.getBoard().getWorkspaceId();
        if (workspaceId != null) {
            card.setReadableId(readableIdService.allocate(workspaceId, cardType));
        }

        card = cardRepository.save(card);

        UUID boardId = column.getBoard().getId();
        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("CARD_CREATED", boardId,
                new BoardEventPayload.CardCreatedData(
                        card.getId(), columnId, card.getTitle(), card.getPosition(),
                        List.of(), card.getDueDate(), card.getPriority(), List.of())));
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
        accessPolicy.assertAccess(card.getColumn().getBoard().getId(), requestingUserId, BoardAction.WRITE);

        if (request.title() != null && !request.title().isBlank()) {
            card.setTitle(request.title());
        }
        card.setDescription(request.description());
        card.setStartDate(request.startDate());
        card.setDueDate(request.dueDate());
        if (request.priority() != null) card.setPriority(request.priority());

        if (request.color() != null && !request.color().matches("^#[0-9A-Fa-f]{6}$")) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_COLOR",
                    "Color must be a valid hex value (e.g. #ff0000)");
        }
        card.setColor(request.color());

        if (request.type() != null) {
            if (!VALID_TYPES.contains(request.type())) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_TYPE",
                        "type must be one of: STORY, FEATURE, BUG");
            }
            card.setType(request.type());
        }

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
                        response.assignees(), card.getDueDate(), card.getPriority(), response.labels(), card.getUpdatedAt())));
        activityLogService.record(boardId, card.getId(), requestingUserId, "CARD_UPDATED",
                "Card \"" + card.getTitle() + "\" updated");

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

        accessPolicy.assertAccess(card.getColumn().getBoard().getId(), requestingUserId, BoardAction.WRITE);

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
        accessPolicy.assertAccess(card.getColumn().getBoard().getId(), requestingUserId, BoardAction.WRITE);

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
        List<UUID> assignees = cardAssigneeRepository.findByCardId(card.getId()).stream()
                .map(com.kanban.model.CardAssignee::getUserId).toList();
        List<ModuleResponse> modules = cardModuleRepository.findByCard(card.getId()).stream()
                .map(cm -> new ModuleResponse(
                        cm.getModuleEntity().getId(),
                        cm.getModuleEntity().getBoard().getId(),
                        cm.getModuleEntity().getName()))
                .toList();
        return new CardResponse(card.getId(), card.getColumn().getId(),
                card.getTitle(), card.getDescription(), card.getPosition(),
                card.getStartDate(), card.getDueDate(), card.getPriority(), labels, assignees,
                subtaskTotal, subtaskDone, commentCount,
                card.getCreatedAt(), card.getUpdatedAt(), card.getColor(), modules,
                card.getType(), card.getReadableId());
    }
}
