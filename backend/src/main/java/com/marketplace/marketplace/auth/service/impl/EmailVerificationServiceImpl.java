package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.dto.request.VerifyEmailRequest;
import com.marketplace.marketplace.auth.entity.EmailVerificationToken;
import com.marketplace.marketplace.auth.repository.EmailVerificationTokenRepository;
import com.marketplace.marketplace.auth.service.EmailVerificationService;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationServiceImpl
        implements EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Override
    public void createAndSendVerificationToken(User user) {

        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(
                        OffsetDateTime.now(ZoneOffset.UTC)
                                .plusHours(24))
                .used(false)
                .build();

        tokenRepository.save(verificationToken);

        /*
         * Email provider integration will be connected here.
         *
         * Development:
         * log/store the verification URL.
         *
         * Production:
         * send through the configured email provider.
         */
    }

    @Override
    public void verify(
            VerifyEmailRequest request) {

        EmailVerificationToken token = tokenRepository.findByToken(
                request.token()).orElseThrow(
                        () -> new AuthenticationException(
                                "Invalid verification token."));

        if (token.isUsed()) {
            throw new AuthenticationException(
                    "Verification token has already been used.");
        }

        if (token.getExpiresAt()
                .isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {

            throw new AuthenticationException(
                    "Verification token has expired.");
        }

        User user = token.getUser();

        user.setEmailVerified(true);
        user.setStatus(
                com.marketplace.marketplace.common.enums.UserStatus.ACTIVE);

        token.setUsed(true);

        userRepository.save(user);
        tokenRepository.save(token);
    }
}