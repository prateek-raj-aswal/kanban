package com.kanban.service;

import com.kanban.dto.request.LoginRequest;
import com.kanban.dto.request.RegisterRequest;
import com.kanban.dto.response.AuthResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.User;
import com.kanban.repository.UserRepository;
import com.kanban.security.JwtTokenProvider;
import com.kanban.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock RefreshTokenService refreshTokenService;

    @InjectMocks AuthService authService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = new User();
        setField(user, "id", userId);
        setField(user, "email", "alice@example.com");
        setField(user, "displayName", "Alice");
        setField(user, "passwordHash", "hashed");
        setField(user, "createdAt", Instant.now());
    }

    @Test
    void register_createsAndReturnsUser() {
        when(userRepository.existsActiveByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(user);

        RegisterRequest req = new RegisterRequest("alice@example.com", "Alice", "secret123");
        AuthResponse res = authService.register(req);

        assertThat(res.email()).isEqualTo("alice@example.com");
        assertThat(res.displayName()).isEqualTo("Alice");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsConflictWhenEmailExists() {
        when(userRepository.existsActiveByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() ->
            authService.register(new RegisterRequest("alice@example.com", "Alice", "secret123"))
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    void login_returnsTokenPairForValidCredentials() {
        when(userRepository.findActiveByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
        when(jwtTokenProvider.generateToken(userId, "alice@example.com")).thenReturn("jwt.token.here");
        when(refreshTokenService.issue(user)).thenReturn("raw-refresh-uuid");

        RefreshTokenService.TokenPair pair = authService.login(new LoginRequest("alice@example.com", "secret123"));

        assertThat(pair.accessToken()).isEqualTo("jwt.token.here");
        assertThat(pair.refreshToken()).isEqualTo("raw-refresh-uuid");
        verify(refreshTokenService).issue(user);
    }

    @Test
    void login_throwsUnauthorizedWhenUserNotFound() {
        when(userRepository.findActiveByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            authService.login(new LoginRequest("ghost@example.com", "pass"))
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);
    }

    @Test
    void login_throwsUnauthorizedWhenPasswordWrong() {
        when(userRepository.findActiveByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() ->
            authService.login(new LoginRequest("alice@example.com", "wrong"))
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);
    }

    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
