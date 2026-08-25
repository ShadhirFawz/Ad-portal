package com.marketplace.marketplace.common.security.filter;

import com.marketplace.marketplace.common.enums.UserStatus;
import com.marketplace.marketplace.common.security.jwt.JwtService;
import com.marketplace.marketplace.common.security.model.AuthenticatedUser;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7).trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        if (!jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            UUID userId = jwtService.extractUserId(token);
            String tokenEmail = jwtService.extractEmail(token);

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                User user = userRepository.findById(userId)
                        .orElse(null);

                if (user != null) {
                    if (user.getStatus() == UserStatus.ACTIVE
                            || user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {

                        String email = (tokenEmail != null && !tokenEmail.isBlank())
                                ? tokenEmail
                                : user.getEmail();

                        AuthenticatedUser principal = new AuthenticatedUser(
                                user.getId(),
                                email,
                                user.getRole());

                        var authorities = List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().name()));

                        var authentication = new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                authorities);

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(authentication);
                    }
                } else {
                    // Supabase authenticated user that is not yet synced in local DB
                    AuthenticatedUser principal = new AuthenticatedUser(
                            userId,
                            tokenEmail,
                            com.marketplace.marketplace.common.enums.Role.USER);

                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_USER"));

                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities);

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}