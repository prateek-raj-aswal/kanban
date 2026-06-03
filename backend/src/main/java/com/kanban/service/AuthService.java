package com.kanban.service;

import com.kanban.dto.request.LoginRequest;
import com.kanban.dto.request.RegisterRequest;
import com.kanban.dto.response.AuthResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.User;
import com.kanban.repository.UserRepository;
import com.kanban.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsActiveByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS",
                    "Email already registered");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setDisplayName(request.displayName());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);
        return new AuthResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getCreatedAt());
    }

    @Transactional
    public RefreshTokenService.TokenPair login(LoginRequest request) {
        User user = userRepository.findActiveByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "Invalid email or password");
        }
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        String refreshToken = refreshTokenService.issue(user);
        return new RefreshTokenService.TokenPair(accessToken, refreshToken);
    }
}
