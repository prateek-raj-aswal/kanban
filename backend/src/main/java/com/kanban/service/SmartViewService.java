package com.kanban.service;

import com.kanban.dto.response.SmartCardResponse;
import com.kanban.model.Card;
import com.kanban.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class SmartViewService {

    private final CardRepository cardRepository;

    public SmartViewService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<SmartCardResponse> inbox(UUID userId) {
        return cardRepository.findInboxCards(userId).stream()
                .map(this::toSmartCard)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SmartCardResponse> today(UUID userId) {
        return cardRepository.findTodayCards(userId, LocalDate.now()).stream()
                .map(this::toSmartCard)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SmartCardResponse> upcoming(UUID userId) {
        LocalDate today = LocalDate.now();
        return cardRepository.findUpcomingCards(userId, today, today.plusDays(7)).stream()
                .map(this::toSmartCard)
                .toList();
    }

    private SmartCardResponse toSmartCard(Card c) {
        return new SmartCardResponse(
                c.getId(),
                c.getTitle(),
                c.getColumn().getBoard().getId(),
                c.getColumn().getBoard().getName(),
                c.getColumn().getId(),
                c.getColumn().getName(),
                c.getDueDate(),
                c.getStartDate(),
                c.getPriority()
        );
    }
}
