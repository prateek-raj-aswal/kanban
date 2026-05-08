package com.kanban.service;

import com.kanban.dto.request.CreateColumnRequest;
import com.kanban.dto.response.ColumnResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardRepository boardRepository;
    private final BoardAccessPolicy accessPolicy;

    public ColumnService(ColumnRepository columnRepository, BoardRepository boardRepository,
                         BoardAccessPolicy accessPolicy) {
        this.columnRepository = columnRepository;
        this.boardRepository = boardRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional
    public ColumnResponse createColumn(UUID boardId, CreateColumnRequest request, UUID requestingUserId) {
        Board board = boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);

        double maxPos = columnRepository.findMaxPositionByBoardId(boardId).orElse(0.0);
        BoardColumn col = new BoardColumn();
        col.setBoard(board);
        col.setName(request.name());
        col.setPosition(maxPos + 1000.0);
        col = columnRepository.save(col);
        return toResponse(col);
    }

    @Transactional
    public ColumnResponse renameColumn(UUID columnId, String name, UUID requestingUserId) {
        BoardColumn col = columnRepository.findActiveById(columnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COLUMN_NOT_FOUND", "Column not found"));
        accessPolicy.assertMember(col.getBoard().getId(), requestingUserId);
        col.setName(name);
        return toResponse(columnRepository.save(col));
    }

    @Transactional
    public void deleteColumn(UUID columnId, UUID requestingUserId) {
        BoardColumn col = columnRepository.findActiveById(columnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COLUMN_NOT_FOUND", "Column not found"));
        accessPolicy.assertMember(col.getBoard().getId(), requestingUserId);
        col.setDeletedAt(Instant.now());
        columnRepository.save(col);
    }

    @Transactional
    public List<ColumnResponse> reorderColumns(UUID boardId, List<UUID> orderedColumnIds, UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);

        List<BoardColumn> cols = columnRepository.findActiveByBoardId(boardId);
        if (cols.size() != orderedColumnIds.size()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                    "Column ID list must contain all board columns");
        }

        double step = 1000.0;
        for (int i = 0; i < orderedColumnIds.size(); i++) {
            UUID id = orderedColumnIds.get(i);
            BoardColumn col = cols.stream().filter(c -> c.getId().equals(id)).findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                            "Unknown column ID in list"));
            col.setPosition((i + 1) * step);
            columnRepository.save(col);
        }

        return columnRepository.findActiveByBoardId(boardId).stream().map(this::toResponse).toList();
    }

    private ColumnResponse toResponse(BoardColumn col) {
        return new ColumnResponse(col.getId(), col.getBoard().getId(), col.getName(),
                col.getPosition(), col.getCreatedAt(), null);
    }
}
