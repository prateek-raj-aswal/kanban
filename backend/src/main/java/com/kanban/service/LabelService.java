package com.kanban.service;

import com.kanban.dto.request.CreateLabelRequest;
import com.kanban.dto.request.UpdateLabelRequest;
import com.kanban.dto.response.LabelResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Label;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.BoardAction;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LabelService {

    private final LabelRepository labelRepository;
    private final BoardRepository boardRepository;
    private final BoardAccessPolicy accessPolicy;

    public LabelService(LabelRepository labelRepository, BoardRepository boardRepository,
                        BoardAccessPolicy accessPolicy) {
        this.labelRepository = labelRepository;
        this.boardRepository = boardRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional
    public LabelResponse createLabel(UUID boardId, CreateLabelRequest request, UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertAccess(boardId, requestingUserId, BoardAction.WRITE);

        Label label = new Label();
        label.setBoardId(boardId);
        label.setName(request.name());
        label.setColor(request.color());
        label = labelRepository.save(label);
        return toResponse(label);
    }

    @Transactional(readOnly = true)
    public List<LabelResponse> getLabels(UUID boardId, UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);
        return labelRepository.findByBoardId(boardId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public LabelResponse updateLabel(UUID labelId, UpdateLabelRequest request, UUID requestingUserId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LABEL_NOT_FOUND", "Label not found"));
        accessPolicy.assertAccess(label.getBoardId(), requestingUserId, BoardAction.WRITE);

        if (request.name() != null && !request.name().isBlank()) label.setName(request.name());
        if (request.color() != null) label.setColor(request.color());
        label = labelRepository.save(label);
        return toResponse(label);
    }

    @Transactional
    public void deleteLabel(UUID labelId, UUID requestingUserId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LABEL_NOT_FOUND", "Label not found"));
        accessPolicy.assertAccess(label.getBoardId(), requestingUserId, BoardAction.WRITE);
        labelRepository.delete(label);
    }

    private LabelResponse toResponse(Label label) {
        return new LabelResponse(label.getId(), label.getName(), label.getColor());
    }
}
