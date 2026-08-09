package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.dto.request.ForgotPasswordRequest;
import com.marketplace.marketplace.auth.dto.request.ResetPasswordRequest;
import com.marketplace.marketplace.auth.entity.PasswordResetToken;
import com.marketplace.marketplace.auth.repository.PasswordResetTokenRepository;
import com.marketplace.marketplace.auth.service.PasswordResetService;
import com.marketplace.marketplace.auth.service.RefreshTokenService;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl
        implements PasswordResetService {

    private final UserService userService;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Override
    public void requestReset(
            ForgotPasswordRequest request) {

        userService.findByEmail(
                request.email().trim().toLowerCase()).ifPresent(user -> {

                    PasswordResetToken token = PasswordResetToken.builder()
                            .user(user)
                            .token(UUID.randomUUID().toString())
                            .expiresAt(
                                    OffsetDateTime.now(
                                            ZoneOffset.UTC).plusHours(1))
                            .used(false)
                            .build();

                    tokenRepository.save(token);

                    /*
                     * Send reset email here.
                     *
                     * Do not reveal whether an email exists
                     * to the API client.
                     */
                });
    }

    @Override
    public void reset(
            ResetPasswordRequest request) {

        PasswordResetToken token = tokenRepository.findByToken(
                request.token()).orElseThrow(
                        () -> new AuthenticationException(
                                "Invalid password reset token."));

        if (token.isUsed()
                || token.getExpiresAt()
                        .isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {

            throw new AuthenticationException(
                    "Password reset token is invalid or expired.");
        }

        User user = token.getUser();

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()));

        refreshTokenService.revokeAll(user);
        token.setUsed(true);

        userService.save(user);
        tokenRepository.save(token);
    }
}