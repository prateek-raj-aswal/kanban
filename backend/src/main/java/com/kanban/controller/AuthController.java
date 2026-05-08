package com.kanban.controller;

import com.kanban.dto.request.LoginRequest;
import com.kanban.dto.request.RegisterRequest;
import com.kanban.dto.response.AuthResponse;
import com.kanban.security.JwtTokenProvider;
import com.kanban.service.AuthService;
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

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of(
                "accessToken", token,
                "tokenType", "Bearer",
                "expiresIn", jwtTokenProvider.getExpiryMs() / 1000
        ));
    }
}
