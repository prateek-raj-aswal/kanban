package com.kanban.service;

import com.kanban.model.RefreshToken;
import com.kanban.model.User;
import com.kanban.repository.RefreshTokenRepository;
import com.kanban.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenRevokeTest {

    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;

    RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, jwtTokenProvider, 604_800_000L);
    }

    // -----------------------------------------------------------------------
    // TC-009: revoke() on a valid live token sets revoked_at
    // -----------------------------------------------------------------------

    @Test
    void revoke_liveToken_setsRevokedAt() {
        String raw = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(raw);

        RefreshToken token = new RefreshToken();
        token.setUser(new User());
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plusSeconds(86400));

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(token));

        refreshTokenService.revoke(raw);

        assertThat(token.getRevokedAt()).isNotNull();
        assertThat(token.getRevokedAt()).isBeforeOrEqualTo(Instant.now());
        verify(refreshTokenRepository).save(token);
    }

    // -----------------------------------------------------------------------
    // TC-010: revoke() on an already-revoked token is a no-op (idempotent)
    // -----------------------------------------------------------------------

    @Test
    void revoke_alreadyRevokedToken_isNoOp() {
        String raw = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(raw);

        RefreshToken token = new RefreshToken();
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plusSeconds(86400));
        token.setRevokedAt(Instant.now().minusSeconds(60));

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(token));

        refreshTokenService.revoke(raw);

        verify(refreshTokenRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // TC-011: revoke() on unknown token is a no-op (idempotent logout)
    // -----------------------------------------------------------------------

    @Test
    void revoke_unknownToken_isNoOp() {
        String raw = UUID.randomUUID().toString();
        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash(raw)))
                .thenReturn(Optional.empty());

        refreshTokenService.revoke(raw);

        verify(refreshTokenRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // TC-015: revoke() on an expired token is a no-op (avoids audit log pollution)
    // -----------------------------------------------------------------------

    @Test
    void revoke_expiredToken_isNoOp() {
        String raw = UUID.randomUUID().toString();
        String hash = RefreshTokenService.hash(raw);

        RefreshToken expired = new RefreshToken();
        expired.setTokenHash(hash);
        expired.setExpiresAt(Instant.now().minusSeconds(1)); // expired

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(expired));

        refreshTokenService.revoke(raw);

        verify(refreshTokenRepository, never()).save(any());
    }
}
