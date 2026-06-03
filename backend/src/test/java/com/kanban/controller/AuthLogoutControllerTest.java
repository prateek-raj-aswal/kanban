package com.kanban.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=test-secret-value-at-least-32-characters-long",
    "jwt.expiry-ms=900000",
    "jwt.refresh-expiry-ms=604800000"
})
class AuthLogoutControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtTokenProvider jwtTokenProvider;

    @MockBean AuthService authService;
    @MockBean RefreshTokenService refreshTokenService;

    // -----------------------------------------------------------------------
    // TC-012: POST /auth/logout without JWT → 204 (refresh token IS the credential)
    // The endpoint is permitAll so callers with an expired access token can still logout.
    // -----------------------------------------------------------------------

    @Test
    void logout_withoutJwt_returns204() throws Exception {
        String rawRefresh = UUID.randomUUID().toString();
        doNothing().when(refreshTokenService).revoke(rawRefresh);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", rawRefresh))))
                .andExpect(status().isNoContent());

        verify(refreshTokenService).revoke(rawRefresh);
    }

    // -----------------------------------------------------------------------
    // TC-013: POST /auth/logout with valid JWT also works → 204, calls revoke
    // -----------------------------------------------------------------------

    @Test
    void logout_withJwt_returns204AndCallsRevoke() throws Exception {
        String rawRefresh = UUID.randomUUID().toString();
        String jwt = jwtTokenProvider.generateToken(UUID.randomUUID(), "alice@example.com");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", rawRefresh))))
                .andExpect(status().isNoContent());

        verify(refreshTokenService).revoke(rawRefresh);
    }

    // -----------------------------------------------------------------------
    // TC-014: POST /auth/logout with missing refreshToken field → 422
    // -----------------------------------------------------------------------

    @Test
    void logout_missingRefreshToken_returns422() throws Exception {
        String jwt = jwtTokenProvider.generateToken(UUID.randomUUID(), "alice@example.com");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity());
    }
}
