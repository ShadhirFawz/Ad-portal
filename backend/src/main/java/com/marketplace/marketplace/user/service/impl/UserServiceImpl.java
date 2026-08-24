package com.marketplace.marketplace.user.service.impl;

import com.marketplace.marketplace.auth.dto.request.SyncUserRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.common.enums.Role;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
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
        return userRepository.existsByUsernameIgnoreCase(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
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
        return userMapper.toResponse(getAuthenticatedUser());
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UpdateProfileRequest request) {

        User user = getAuthenticatedUser();

        if (request.username() != null && !request.username().isBlank()) {

            String username = request.username().trim().toLowerCase();

            if (!username.equals(user.getUsername())
                    && existsByUsername(username)) {

                throw new ConflictException("Username is already taken.");
            }

            user.setUsername(username);
        }

        if (request.firstName() != null) {
            user.setFirstName(request.firstName().trim());
        }

        if (request.lastName() != null) {
            user.setLastName(trimToNull(request.lastName()));
        }

        if (request.bio() != null) {
            user.setBio(trimToNull(request.bio()));
        }

        if (request.location() != null) {
            user.setLocation(trimToNull(request.location()));
        }

        if (request.publicProfile() != null) {
            user.setPublicProfile(request.publicProfile());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        User user = getAuthenticatedUser();

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ConflictException("New password must be different from the current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {

        User user = getAuthenticatedUser();

        user.setStatus(UserStatus.DELETED);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getPublicProfile(String username) {

        User user = userRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!user.getPublicProfile() || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("User not found.");
        }

        return userMapper.toResponse(user);
    }

    /**
     * Upserts the Supabase user into the local DB.
     * If the user already exists, it is returned as-is.
     * If not, a new local record is seeded from the JWT sub + optional profile hints.
     */
    @Override
    @Transactional
    public UserResponse syncCurrentUser(SyncUserRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        String tokenEmail = SecurityUtils.getCurrentUserEmail();

        String resolvedEmail = (request != null && request.email() != null && !request.email().isBlank())
                ? request.email().trim()
                : ((tokenEmail != null && !tokenEmail.isBlank())
                        ? tokenEmail.trim()
                        : ("user-" + userId + "@marketplace.com"));

        return userMapper.toResponse(
                userRepository.findById(userId)
                        .map(existingUser -> {
                            // If existing user had a temporary placeholder email, update to their real email
                            if (existingUser.getEmail() != null
                                    && existingUser.getEmail().startsWith("user-")
                                    && !resolvedEmail.startsWith("user-")) {
                                existingUser.setEmail(resolvedEmail);
                            }

                            if (request != null) {
                                if (request.firstName() != null && !request.firstName().isBlank()) {
                                    existingUser.setFirstName(request.firstName().trim());
                                }
                                if (request.lastName() != null) {
                                    existingUser.setLastName(trimToNull(request.lastName()));
                                }
                                if (request.phoneNumber() != null) {
                                    existingUser.setPhoneNumber(trimToNull(request.phoneNumber()));
                                }
                                if (request.username() != null && !request.username().isBlank()) {
                                    String uname = request.username().trim().toLowerCase();
                                    if (!uname.equals(existingUser.getUsername()) && !userRepository.existsByUsername(uname)) {
                                        existingUser.setUsername(uname);
                                    }
                                }
                            }
                            existingUser.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC));
                            return userRepository.save(existingUser);
                        })
                        .orElseGet(() -> {
                            String firstName = (request != null
                                    && request.firstName() != null
                                    && !request.firstName().isBlank())
                                    ? request.firstName().trim()
                                    : "User";

                            String lastName = (request != null) ? trimToNull(request.lastName()) : null;
                            String phoneNumber = (request != null) ? trimToNull(request.phoneNumber()) : null;
                            String username = (request != null) ? trimToNull(request.username()) : null;

                            User newUser = User.builder()
                                    .email(resolvedEmail)
                                    .firstName(firstName)
                                    .lastName(lastName)
                                    .phoneNumber(phoneNumber)
                                    .username(username)
                                    .role(Role.USER)
                                    .status(UserStatus.ACTIVE)
                                    .emailVerified(true)
                                    .phoneVerified(false)
                                    .publicProfile(true)
                                    .lastLoginAt(OffsetDateTime.now(ZoneOffset.UTC))
                                    .build();
                            newUser.setId(userId);
                            newUser.setIsNew(true);

                            return userRepository.save(newUser);
                        }));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Returns the local DB user for the currently authenticated Supabase user,
     * creating a minimal record on first access if one does not exist.
     */
    private User getAuthenticatedUser() {

        UUID userId = SecurityUtils.getCurrentUserId();
        String tokenEmail = SecurityUtils.getCurrentUserEmail();

        return userRepository.findById(userId)
                .map(existingUser -> {
                    if (existingUser.getEmail() != null
                            && existingUser.getEmail().startsWith("user-")
                            && tokenEmail != null
                            && !tokenEmail.isBlank()
                            && !tokenEmail.startsWith("user-")) {
                        existingUser.setEmail(tokenEmail.trim());
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    String email = (tokenEmail != null && !tokenEmail.isBlank())
                            ? tokenEmail.trim()
                            : ("user-" + userId + "@marketplace.com");

                    User user = User.builder()
                            .email(email)
                            .firstName("User")
                            .role(Role.USER)
                            .status(UserStatus.ACTIVE)
                            .emailVerified(true)
                            .phoneVerified(false)
                            .publicProfile(true)
                            .lastLoginAt(OffsetDateTime.now(ZoneOffset.UTC))
                            .build();
                    user.setId(userId);
                    user.setIsNew(true);
                    return userRepository.save(user);
                });
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}