package com.kanban.service;

import com.kanban.dto.response.AssigneeResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.CardAssignee;
import com.kanban.model.User;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CardAssigneeService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final CardAssigneeRepository cardAssigneeRepository;
    private final BoardAccessPolicy accessPolicy;

    public CardAssigneeService(CardRepository cardRepository, UserRepository userRepository,
                                CardAssigneeRepository cardAssigneeRepository, BoardAccessPolicy accessPolicy) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.cardAssigneeRepository = cardAssigneeRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional(readOnly = true)
    public List<AssigneeResponse> listAssignees(UUID cardId, UUID requestingUserId) {
        Card card = findCardOrThrow(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        List<CardAssignee> assignments = cardAssigneeRepository.findByCardId(cardId);
        if (assignments.isEmpty()) return List.of();

        List<UUID> userIds = assignments.stream().map(CardAssignee::getUserId).toList();
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return assignments.stream()
                .map(a -> {
                    User u = userMap.get(a.getUserId());
                    return new AssigneeResponse(a.getUserId(),
                            u != null ? u.getEmail() : "",
                            u != null ? u.getDisplayName() : "",
                            a.getAssignedAt());
                })
                .toList();
    }

    @Transactional
    public AssigneeResponse addAssignee(UUID cardId, UUID userId, UUID requestingUserId) {
        Card card = findCardOrThrow(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (cardAssigneeRepository.existsByCardIdAndUserId(cardId, userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_ASSIGNED", "User is already assigned to this card");
        }

        CardAssignee assignment = new CardAssignee();
        assignment.setCardId(cardId);
        assignment.setUserId(userId);
        CardAssignee saved = cardAssigneeRepository.save(assignment);

        return new AssigneeResponse(userId, user.getEmail(), user.getDisplayName(), saved.getAssignedAt());
    }

    @Transactional
    public void removeAssignee(UUID cardId, UUID userId, UUID requestingUserId) {
        Card card = findCardOrThrow(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);

        if (!cardAssigneeRepository.existsByCardIdAndUserId(cardId, userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_ASSIGNED", "User is not assigned to this card");
        }

        cardAssigneeRepository.deleteByCardIdAndUserId(cardId, userId);
    }

    private Card findCardOrThrow(UUID cardId) {
        return cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
    }
}
