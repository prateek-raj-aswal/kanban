package com.kanban.websocket;

import com.kanban.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketConfigTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private MessageChannel channel;

    private WebSocketConfig config;

    @BeforeEach
    void setUp() {
        config = new WebSocketConfig(jwtTokenProvider);
    }

    @Test
    void connectWithValidJwt_setsUserPrincipal() {
        UUID userId = UUID.randomUUID();
        String email = "user@example.com";

        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(userId.toString());
        when(claims.get("email", String.class)).thenReturn(email);
        when(jwtTokenProvider.parseToken("valid.token")).thenReturn(claims);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer valid.token");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        // Apply interceptor via an anonymous subclass approach — invoke directly
        var interceptorHolder = new Object() {
            org.springframework.messaging.support.ChannelInterceptor captured;
        };

        // Re-read the interceptor by capturing it from registration
        // Since configureClientInboundChannel registers the interceptor, we test behavior directly
        // by rebuilding the test using the config's interceptor logic
        Message<?> result = invokeInterceptor(message);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.getAccessor(result, StompHeaderAccessor.class);
        assertThat(resultAccessor).isNotNull();
        assertThat(resultAccessor.getUser()).isNotNull();
        var auth = (org.springframework.security.authentication.UsernamePasswordAuthenticationToken) resultAccessor.getUser();
        var principal = (com.kanban.security.AuthenticatedUser) auth.getPrincipal();
        assertThat(principal.id()).isEqualTo(userId);
        assertThat(principal.email()).isEqualTo(email);
    }

    @Test
    void connectWithoutAuthHeader_throwsAccessDeniedException() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> invokeInterceptor(message))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void connectWithInvalidJwt_throwsAccessDeniedException() {
        when(jwtTokenProvider.parseToken("bad.token"))
                .thenThrow(new io.jsonwebtoken.JwtException("invalid"));

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer bad.token");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> invokeInterceptor(message))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void nonConnectFrame_passesThrough() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        // Should not throw even with no auth header
        Message<?> result = invokeInterceptor(message);
        assertThat(result).isSameAs(message);
    }

    // Helper: extract and invoke the channel interceptor registered by WebSocketConfig
    private Message<?> invokeInterceptor(Message<byte[]> message) {
        var registration = new org.springframework.messaging.simp.config.ChannelRegistration();
        config.configureClientInboundChannel(registration);
        // ChannelRegistration.getInterceptors() is package-private; use reflection
        try {
            var field = org.springframework.messaging.simp.config.ChannelRegistration.class
                    .getDeclaredField("interceptors");
            field.setAccessible(true);
            @SuppressWarnings("unchecked")
            var interceptors = (java.util.List<org.springframework.messaging.support.ChannelInterceptor>) field.get(registration);
            assertThat(interceptors).hasSize(1);
            return interceptors.get(0).preSend(message, channel);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
