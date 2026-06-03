package com.kanban.service;

import com.kanban.exception.ApiException;
import com.kanban.model.RefreshToken;
import com.kanban.model.User;
import com.kanban.repository.RefreshTokenRepository;
import com.kanban.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshExpiryMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider jwtTokenProvider,
            @Value("${jwt.refresh-expiry-ms:604800000}") long refreshExpiryMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshExpiryMs = refreshExpiryMs;
    }

    /** Issue a new refresh token for the user; returns the raw (unhashed) token string. */
    @Transactional
    public String issue(User user) {
        String raw = UUID.randomUUID().toString();
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(Instant.now().plusMillis(refreshExpiryMs));
        refreshTokenRepository.save(token);
        return raw;
    }

    /**
     * Rotate: validate the raw token, revoke it, issue a new pair.
     * Reused (already-revoked) tokens trigger a full family revocation per RFC 6819.
     */
    @Transactional
    public TokenPair rotate(String rawToken) {
        String hash = hash(rawToken);
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token"));

        if (existing.isExpired()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    "INVALID_REFRESH_TOKEN", "Refresh token expired");
        }

        // Reuse of a still-valid but already-revoked token = theft indicator; revoke entire family
        if (existing.isRevoked()) {
            refreshTokenRepository.revokeAllByUserId(existing.getUser().getId(), Instant.now());
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                    "INVALID_REFRESH_TOKEN", "Refresh token already used");
        }

        User user = existing.getUser();
        String newRaw = UUID.randomUUID().toString();

        RefreshToken newToken = new RefreshToken();
        newToken.setUser(user);
        newToken.setTokenHash(hash(newRaw));
        newToken.setExpiresAt(Instant.now().plusMillis(refreshExpiryMs));
        refreshTokenRepository.save(newToken);

        existing.setRevokedAt(Instant.now());
        existing.setReplacedBy(newToken.getId());
        refreshTokenRepository.save(existing);

        String newAccess = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new TokenPair(newAccess, newRaw);
    }

    /**
     * Revoke a specific refresh token by raw value. Idempotent — unknown or already-revoked
     * tokens are silently ignored so logout is always safe to call.
     */
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            if (!token.isRevoked() && !token.isExpired()) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            }
        });
    }

    public static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public record TokenPair(String accessToken, String refreshToken) {}
}
