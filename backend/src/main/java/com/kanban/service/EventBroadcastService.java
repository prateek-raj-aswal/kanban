package com.kanban.service;

import com.kanban.websocket.BoardEventPayload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EventBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public EventBroadcastService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastBoardEvent(UUID boardId, BoardEventPayload event) {
        messagingTemplate.convertAndSend("/topic/boards/" + boardId, event);
    }
}
