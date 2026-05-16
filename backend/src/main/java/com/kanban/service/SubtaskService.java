package com.kanban.service;

import com.kanban.dto.request.CreateSubtaskRequest;
import com.kanban.dto.request.UpdateSubtaskRequest;
import com.kanban.dto.response.SubtaskResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.Subtask;
import com.kanban.repository.CardRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final CardRepository cardRepository;
    private final BoardAccessPolicy accessPolicy;

    public SubtaskService(SubtaskRepository subtaskRepository, CardRepository cardRepository,
                          BoardAccessPolicy accessPolicy) {
        this.subtaskRepository = subtaskRepository;
        this.cardRepository = cardRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional(readOnly = true)
    public List<SubtaskResponse> listSubtasks(UUID cardId, UUID requestingUserId) {
        Card card = requireCard(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);
        return subtaskRepository.findByCardIdOrderByPositionAsc(cardId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public SubtaskResponse createSubtask(UUID cardId, CreateSubtaskRequest request, UUID requestingUserId) {
        Card card = requireCard(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        double maxPos = subtaskRepository.findMaxPositionByCardId(cardId).orElse(0.0);
        Subtask s = new Subtask();
        s.setCard(card);
        s.setTitle(request.title());
        s.setPosition(maxPos + 1000.0);
        return toResponse(subtaskRepository.save(s));
    }

    @Transactional
    public SubtaskResponse updateSubtask(UUID subtaskId, UpdateSubtaskRequest request, UUID requestingUserId) {
        Subtask s = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBTASK_NOT_FOUND", "Subtask not found"));
        accessPolicy.assertMember(s.getCard().getColumn().getBoard().getId(), requestingUserId);
        if (request.title() != null && !request.title().isBlank()) s.setTitle(request.title());
        if (request.completed() != null) s.setCompleted(request.completed());
        return toResponse(subtaskRepository.save(s));
    }

    @Transactional
    public void deleteSubtask(UUID subtaskId, UUID requestingUserId) {
        Subtask s = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUBTASK_NOT_FOUND", "Subtask not found"));
        accessPolicy.assertMember(s.getCard().getColumn().getBoard().getId(), requestingUserId);
        subtaskRepository.delete(s);
    }

    private Card requireCard(UUID cardId) {
        return cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
    }

    private SubtaskResponse toResponse(Subtask s) {
        return new SubtaskResponse(s.getId(), s.getCard().getId(), s.getTitle(),
                s.isCompleted(), s.getPosition(), s.getCreatedAt());
    }
}
