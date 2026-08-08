package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.dto.request.LoginRequest;
import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.response.AuthResponse;
import com.marketplace.marketplace.auth.entity.RefreshToken;
import com.marketplace.marketplace.auth.repository.RefreshTokenRepository;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.enums.Role;
import com.marketplace.marketplace.common.enums.UserStatus;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.security.config.JwtProperties;
import com.marketplace.marketplace.common.security.jwt.JwtService;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.mapper.UserMapper;
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
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public UserResponse register(RegisterRequest request) {

        validateRegistration(request);

        User user = buildUser(request);

        user = userService.save(user);

        return userMapper.toResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash())) {
            throw new AuthenticationException(
                    "Invalid email or password.");
        }

        validateAccountStatus(user);

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getRole().name());

        RefreshToken refreshToken = createRefreshToken(user);

        user.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC));

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                userMapper.toResponse(user));
    }

    private RefreshToken createRefreshToken(User user) {

        String token = UUID.randomUUID().toString();

        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC)
                .plus(jwtProperties.refreshTokenExpiration());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private void validateAccountStatus(User user) {

        if (user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
            throw new AuthenticationException(
                    "Please verify your email before logging in.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new AuthenticationException(
                    "Your account has been suspended.");
        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new AuthenticationException(
                    "Your account has been banned.");
        }

        if (user.getStatus() == UserStatus.DELETED) {
            throw new AuthenticationException(
                    "This account is no longer available.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AuthenticationException(
                    "Your account is not available for login.");
        }
    }

    private void validateRegistration(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userService.existsByEmail(email)) {
            throw new ConflictException(
                    "Email is already registered.");
        }

        if (request.phoneNumber() != null
                && !request.phoneNumber().isBlank()
                && userService.existsByPhoneNumber(
                        request.phoneNumber())) {

            throw new ConflictException(
                    "Phone number is already registered.");
        }
    }

    private User buildUser(RegisterRequest request) {

        return User.builder()
                .email(normalizeEmail(request.email()))
                .passwordHash(
                        passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim())
                .lastName(trimToNull(request.lastName()))
                .phoneNumber(trimToNull(request.phoneNumber()))
                .role(Role.USER)
                .status(UserStatus.PENDING_EMAIL_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .publicProfile(true)
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }
}