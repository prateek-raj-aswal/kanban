package com.kanban.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanban.exception.ApiException;
import com.kanban.security.JwtAuthenticationFilter;
import com.kanban.security.JwtTokenProvider;
import com.kanban.security.SecurityConfig;
import com.kanban.service.AuthService;
import com.kanban.service.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=test-secret-value-at-least-32-characters-long",
    "jwt.expiry-ms=900000",
    "jwt.refresh-expiry-ms=604800000"
})
class AuthRefreshControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtTokenProvider jwtTokenProvider;

    @MockBean AuthService authService;
    @MockBean RefreshTokenService refreshTokenService;

    // -----------------------------------------------------------------------
    // TC-006: POST /auth/refresh with valid token → 200 + new pair
    // -----------------------------------------------------------------------

    @Test
    void refresh_validToken_returns200WithNewPair() throws Exception {
        String rawToken = "valid-refresh-uuid";
        var pair = new RefreshTokenService.TokenPair("new.access.jwt", "new-refresh-uuid");
        when(refreshTokenService.rotate(rawToken)).thenReturn(pair);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", rawToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new.access.jwt"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-uuid"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    // -----------------------------------------------------------------------
    // TC-007: POST /auth/refresh with bad token → 401
    // -----------------------------------------------------------------------

    @Test
    void refresh_invalidToken_returns401() throws Exception {
        String rawToken = "unknown-token";
        when(refreshTokenService.rotate(rawToken))
                .thenThrow(new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Invalid or expired"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", rawToken))))
                .andExpect(status().isUnauthorized());
    }

    // -----------------------------------------------------------------------
    // TC-008: POST /auth/refresh with missing body field → 422 (global validator)
    // -----------------------------------------------------------------------

    @Test
    void refresh_missingField_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity());
    }
}
