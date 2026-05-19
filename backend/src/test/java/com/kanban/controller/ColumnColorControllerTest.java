package com.kanban.controller;

import com.kanban.security.JwtAuthenticationFilter;
import com.kanban.security.JwtTokenProvider;
import com.kanban.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ColumnColorController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=test-secret-value-at-least-32-characters-long",
    "jwt.expiry-ms=3600000"
})
class ColumnColorControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtTokenProvider jwtTokenProvider;

    @Test
    void getColumnColors_withValidJwt_returns200WithTokensAndColorMap() throws Exception {
        String token = jwtTokenProvider.generateToken(UUID.randomUUID(), "user@example.com");

        mockMvc.perform(get("/api/v1/column-colors")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokens", hasSize(8)))
                .andExpect(jsonPath("$.tokens[0]").value("yellow"))
                .andExpect(jsonPath("$.tokens[1]").value("green"))
                .andExpect(jsonPath("$.tokens[2]").value("red"))
                .andExpect(jsonPath("$.tokens[3]").value("blue"))
                .andExpect(jsonPath("$.tokens[4]").value("purple"))
                .andExpect(jsonPath("$.tokens[5]").value("orange"))
                .andExpect(jsonPath("$.tokens[6]").value("teal"))
                .andExpect(jsonPath("$.tokens[7]").value("gray"))
                .andExpect(jsonPath("$.colorMap.yellow").value("#FDE68A"))
                .andExpect(jsonPath("$.colorMap.green").value("#6EE7B7"))
                .andExpect(jsonPath("$.colorMap.red").value("#FCA5A5"))
                .andExpect(jsonPath("$.colorMap.blue").value("#93C5FD"))
                .andExpect(jsonPath("$.colorMap.purple").value("#C4B5FD"))
                .andExpect(jsonPath("$.colorMap.orange").value("#FCD34D"))
                .andExpect(jsonPath("$.colorMap.teal").value("#5EEAD4"))
                .andExpect(jsonPath("$.colorMap.gray").value("#D1D5DB"));
    }

    @Test
    void getColumnColors_withoutJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/column-colors"))
                .andExpect(status().isUnauthorized());
    }
}
