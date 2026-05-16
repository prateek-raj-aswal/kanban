package com.kanban.service;

import com.kanban.dto.response.NotificationResponse;
import com.kanban.model.Notification;
import com.kanban.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notifyAssignment(UUID assigneeId, UUID cardId, UUID boardId, String cardTitle) {
        Notification n = new Notification();
        n.setUserId(assigneeId);
        n.setCardId(cardId);
        n.setBoardId(boardId);
        n.setType("CARD_ASSIGNED");
        n.setMessage("You were assigned to card \"" + cardTitle + "\"");
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyMention(UUID mentionedUserId, UUID cardId, UUID boardId, String mentionedByName) {
        Notification n = new Notification();
        n.setUserId(mentionedUserId);
        n.setCardId(cardId);
        n.setBoardId(boardId);
        n.setType("MENTIONED");
        n.setMessage(mentionedByName + " mentioned you in a comment");
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(UUID notificationId, UUID userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getCardId(), n.getBoardId(),
                n.getType(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
