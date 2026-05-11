package com.kanban.service;

import com.kanban.websocket.BoardEventPayload;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EventBroadcastServiceTest {

    @Mock
    SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    EventBroadcastService eventBroadcastService;

    @Test
    void broadcastBoardEvent_sendsToCorrectTopic() {
        UUID boardId = UUID.randomUUID();
        BoardEventPayload payload = BoardEventPayload.of("CARD_CREATED", boardId,
                new BoardEventPayload.CardDeletedData(UUID.randomUUID(), UUID.randomUUID()));

        eventBroadcastService.broadcastBoardEvent(boardId, payload);

        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<BoardEventPayload> payloadCaptor = ArgumentCaptor.forClass(BoardEventPayload.class);
        verify(messagingTemplate).convertAndSend(topicCaptor.capture(), payloadCaptor.capture());

        assertThat(topicCaptor.getValue()).isEqualTo("/topic/boards/" + boardId);
        assertThat(payloadCaptor.getValue()).isSameAs(payload);
    }
}
