package com.kanban.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expiryMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-ms}") long expiryMs) {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set and at least 32 characters long. Refusing to start.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMs = expiryMs;
    }

    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiryMs))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public long getExpiryMs() { return expiryMs; }
}
