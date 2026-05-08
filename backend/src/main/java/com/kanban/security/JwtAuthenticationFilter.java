package com.kanban.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtTokenProvider.parseToken(token);
                UUID userId = UUID.fromString(claims.getSubject());
                AuthenticatedUser principal = new AuthenticatedUser(userId, claims.get("email", String.class));
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException ignored) {
                // Invalid token — continue unauthenticated; 401 returned by SecurityConfig
            }
        }
        filterChain.doFilter(request, response);
    }
}
