package com.marketplace.marketplace.user.service.impl;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.RefreshTokenService;
import com.marketplace.marketplace.common.enums.UserStatus;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.user.dto.request.ChangePasswordRequest;
import com.marketplace.marketplace.user.dto.request.UpdateProfileRequest;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.mapper.UserMapper;
import com.marketplace.marketplace.user.repository.UserRepository;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return phoneNumber != null
                && !phoneNumber.isBlank()
                && userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {

        return userRepository
                .existsByUsernameIgnoreCase(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {

        return userRepository
                .findByUsernameIgnoreCase(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {

        User user = getAuthenticatedUser();

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(
            UpdateProfileRequest request) {

        User user = getAuthenticatedUser();

        if (request.username() != null
                && !request.username().isBlank()) {

            String username = request.username().trim().toLowerCase();

            if (!username.equals(user.getUsername())
                    && existsByUsername(username)) {

                throw new ConflictException(
                        "Username is already taken.");
            }

            user.setUsername(username);
        }

        if (request.firstName() != null) {
            user.setFirstName(
                    request.firstName().trim());
        }

        if (request.lastName() != null) {
            user.setLastName(
                    trimToNull(request.lastName()));
        }

        if (request.bio() != null) {
            user.setBio(
                    trimToNull(request.bio()));
        }

        if (request.location() != null) {
            user.setLocation(
                    trimToNull(request.location()));
        }

        if (request.publicProfile() != null) {
            user.setPublicProfile(
                    request.publicProfile());
        }

        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(
            ChangePasswordRequest request) {

        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash())) {

            throw new AuthenticationException(
                    "Current password is incorrect.");
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash())) {

            throw new ConflictException(
                    "New password must be different from the current password.");
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()));

        userRepository.save(user);

        refreshTokenService.revokeAll(user);
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {

        User user = getAuthenticatedUser();

        user.setStatus(UserStatus.DELETED);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);

        refreshTokenService.revokeAll(user);

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getPublicProfile(
            String username) {

        User user = userRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));

        if (!user.getPublicProfile()
                || user.getStatus() != UserStatus.ACTIVE) {

            throw new ResourceNotFoundException(
                    "User not found.");
        }

        return userMapper.toResponse(user);
    }

    private User getAuthenticatedUser() {

        UUID userId = SecurityUtils.getCurrentUserId();

        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(
                        "User not found."));
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