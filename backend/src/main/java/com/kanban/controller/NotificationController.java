package com.kanban.controller;

import com.kanban.dto.response.NotificationResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return notificationService.getNotifications(user.id());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal AuthenticatedUser user) {
        return Map.of("count", notificationService.getUnreadCount(user.id()));
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        notificationService.markRead(id, user.id());
    }

    @PostMapping("/read-all")
    public void markAllRead(@AuthenticationPrincipal AuthenticatedUser user) {
        notificationService.markAllRead(user.id());
    }
}
