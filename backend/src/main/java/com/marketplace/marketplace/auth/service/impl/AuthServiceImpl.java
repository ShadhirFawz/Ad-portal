package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.enums.Role;
import com.marketplace.marketplace.common.enums.UserStatus;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.mapper.UserMapper;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse register(RegisterRequest request) {

        validateRegistration(request);

        User user = buildUser(request);

        user = userService.save(user);

        return userMapper.toResponse(user);
    }

    private void validateRegistration(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userService.existsByEmail(email)) {
            throw new ConflictException("Email is already registered.");
        }

        if (request.phoneNumber() != null
                && !request.phoneNumber().isBlank()
                && userService.existsByPhoneNumber(request.phoneNumber())) {

            throw new ConflictException("Phone number is already registered.");
        }
    }

    private User buildUser(RegisterRequest request) {

        return User.builder()
                .email(normalizeEmail(request.email()))
                .passwordHash(passwordEncoder.encode(request.password()))
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
        return trimmed.isEmpty() ? null : trimmed;
    }
}