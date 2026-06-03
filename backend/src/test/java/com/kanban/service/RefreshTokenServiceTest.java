package com.kanban.service;

import com.kanban.exception.ApiException;
import com.kanban.model.RefreshToken;
import com.kanban.model.User;
import com.kanban.repository.RefreshTokenRepository;
import com.kanban.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;

    RefreshTokenService refreshTokenService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        // Manually construct to supply @Value param (7-day refresh expiry for tests)
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, jwtTokenProvider, 604_800_000L);
        userId = UUID.randomUUID();
        user = new User();
        setField(user, "id", userId);
        setField(user, "email", "alice@example.com");
    }

    // -----------------------------------------------------------------------
    // TC-001: issue() persists a refresh token and returns its raw value
    // -----------------------------------------------------------------------

    @Test
    void issue_persistsHashedToken_andReturnsRawUuid() {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        String raw = refreshTokenService.issue(user);

        assertThat(raw).isNotBlank();
        ArgumentCaptor<RefreshToken> cap = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(cap.capture());
        RefreshToken saved = cap.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getTokenHash()).isNotBlank();
        assertThat(saved.getTokenHash()).isNotEqualTo(raw); // stored hash != raw token
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());
        assertThat(saved.getRevokedAt()).isNull();
    }

    // -----------------------------------------------------------------------
    // TC-002: rotate() on a valid token returns new access + refresh
    // -----------------------------------------------------------------------

    @Test
    void rotate_validToken_returnsNewAccessAndRefresh() {
        UUID tokenId = UUID.randomUUID();
        String rawInput = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(rawInput);

        RefreshToken existing = buildToken(tokenId, user, hash, Instant.now().plusSeconds(86400), null);
        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(existing));
        when(jwtTokenProvider.generateToken(userId, "alice@example.com")).thenReturn("new.access.jwt");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            if (t.getId() == null) setField(t, "id", UUID.randomUUID()); // simulate JPA UUID generation
            return t;
        });

        RefreshTokenService.TokenPair pair = refreshTokenService.rotate(rawInput);

        assertThat(pair.accessToken()).isEqualTo("new.access.jwt");
        assertThat(pair.refreshToken()).isNotBlank();
        assertThat(pair.refreshToken()).isNotEqualTo(rawInput); // rotated
        assertThat(existing.getRevokedAt()).isNotNull(); // old token revoked
        assertThat(existing.getReplacedBy()).isNotNull(); // tracked
    }

    // -----------------------------------------------------------------------
    // TC-003: rotate() on unknown token → 401
    // -----------------------------------------------------------------------

    @Test
    void rotate_unknownToken_throws401() {
        String rawInput = UUID.randomUUID().toString();
        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash(rawInput)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.rotate(rawInput))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);
    }

    // -----------------------------------------------------------------------
    // TC-004: rotate() on expired token → 401
    // -----------------------------------------------------------------------

    @Test
    void rotate_expiredToken_throws401() {
        String raw = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(raw);

        RefreshToken expired = buildToken(UUID.randomUUID(), user, hash,
                Instant.now().minusSeconds(1), null); // expired 1s ago
        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> refreshTokenService.rotate(raw))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);
    }

    // -----------------------------------------------------------------------
    // TC-005: rotate() on revoked-but-not-expired token → 401 + revoke whole family
    // (token still within expiry window but already revoked = reuse/theft indicator)
    // -----------------------------------------------------------------------

    @Test
    void rotate_revokedToken_throws401AndRevokesFamily() {
        String raw = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(raw);

        // Still within expiry window but revoked — simulates token reuse attack
        RefreshToken revoked = buildToken(UUID.randomUUID(), user, hash,
                Instant.now().plusSeconds(86400), Instant.now().minusSeconds(60));
        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(revoked));

        assertThatThrownBy(() -> refreshTokenService.rotate(raw))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED);

        verify(refreshTokenRepository).revokeAllByUserId(eq(userId), any(Instant.class));
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private RefreshToken buildToken(UUID id, User owner, String hash, Instant expiresAt, Instant revokedAt) {
        RefreshToken t = new RefreshToken();
        setField(t, "id", id);
        t.setUser(owner);
        t.setTokenHash(hash);
        t.setExpiresAt(expiresAt);
        if (revokedAt != null) t.setRevokedAt(revokedAt);
        return t;
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
