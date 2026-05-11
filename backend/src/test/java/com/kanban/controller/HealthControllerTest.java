package com.kanban.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import com.kanban.security.SecurityConfig;
import com.kanban.security.JwtAuthenticationFilter;
import com.kanban.security.JwtTokenProvider;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=test-secret-value-at-least-32-characters-long",
    "jwt.expiry-ms=3600000"
})
class HealthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void health_returns200WithStatusUp() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void health_isPublicNoAuthRequired() throws Exception {
        // no Authorization header — must still return 200
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());
    }
}
