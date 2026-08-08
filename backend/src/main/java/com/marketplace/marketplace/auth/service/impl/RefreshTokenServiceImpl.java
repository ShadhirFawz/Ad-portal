package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.entity.RefreshToken;
import com.marketplace.marketplace.auth.repository.RefreshTokenRepository;
import com.marketplace.marketplace.auth.service.RefreshTokenService;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.common.security.config.JwtProperties;
import com.marketplace.marketplace.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Override
    public RefreshToken create(User user) {

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(
                        OffsetDateTime.now(ZoneOffset.UTC)
                                .plus(
                                        jwtProperties
                                                .refreshTokenExpiration()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken validate(String token) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthenticationException(
                        "Invalid refresh token."));

        if (refreshToken.getRevoked()) {
            throw new AuthenticationException(
                    "Refresh token has been revoked.");
        }

        if (refreshToken.getExpiresAt()
                .isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {

            throw new AuthenticationException(
                    "Refresh token has expired.");
        }

        return refreshToken;
    }

    @Override
    public RefreshToken rotate(
            RefreshToken refreshToken) {

        refreshToken.setRevoked(true);

        refreshTokenRepository.save(refreshToken);

        return create(refreshToken.getUser());
    }

    @Override
    public void revoke(String token) {

        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Override
    public void revokeAll(User user) {

        refreshTokenRepository
                .findByUser(user)
                .forEach(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }
}