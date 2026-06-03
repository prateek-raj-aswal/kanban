package com.kanban.controller;

import com.kanban.dto.request.LoginRequest;
import com.kanban.dto.request.RefreshRequest;
import com.kanban.dto.request.RegisterRequest;
import com.kanban.dto.response.AuthResponse;
import com.kanban.security.JwtTokenProvider;
import com.kanban.service.AuthService;
import com.kanban.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider,
                          RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        RefreshTokenService.TokenPair pair = authService.login(request);
        return ResponseEntity.ok(buildTokenResponse(pair));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@Valid @RequestBody RefreshRequest request) {
        RefreshTokenService.TokenPair pair = refreshTokenService.rotate(request.refreshToken());
        return ResponseEntity.ok(buildTokenResponse(pair));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        refreshTokenService.revoke(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> buildTokenResponse(RefreshTokenService.TokenPair pair) {
        return Map.of(
                "accessToken", pair.accessToken(),
                "refreshToken", pair.refreshToken(),
                "tokenType", "Bearer",
                "expiresIn", jwtTokenProvider.getExpiryMs() / 1000
        );
    }
}
