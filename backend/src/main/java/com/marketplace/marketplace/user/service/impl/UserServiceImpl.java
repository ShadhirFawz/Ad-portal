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
import com.marketplace.marketplace.user.entity.UserPhoneNumber;
import com.marketplace.marketplace.user.mapper.UserMapper;
import com.marketplace.marketplace.user.repository.UserRepository;
import com.marketplace.marketplace.user.repository.UserPhoneNumberRepository;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserPhoneNumberRepository userPhoneNumberRepository;
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
                && (userPhoneNumberRepository.existsByPhoneNumber(phoneNumber)
                        || userRepository.existsByPhoneNumber(phoneNumber));
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

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().isBlank() ? null : request.avatarUrl().trim());
        }

        if (request.coverPhotoUrl() != null) {
            user.setCoverPhotoUrl(request.coverPhotoUrl().isBlank() ? null : request.coverPhotoUrl().trim());
        }

        if (request.phoneNumbers() != null) {
            if (request.phoneNumbers().size() > 3) {
                throw new ConflictException("You can add a maximum of 3 phone numbers.");
            }

            List<String> trimmedNumbers = request.phoneNumbers().stream()
                    .map(p -> p.phoneNumber() != null ? p.phoneNumber().trim() : "")
                    .filter(s -> !s.isEmpty())
                    .toList();

            Set<String> uniqueNumbers = new HashSet<>(trimmedNumbers);
            if (uniqueNumbers.size() < trimmedNumbers.size()) {
                throw new ConflictException("Duplicate phone numbers are not allowed.");
            }

            for (String num : trimmedNumbers) {
                if (userPhoneNumberRepository.existsByPhoneNumberAndUserIdNot(num, user.getId())) {
                    throw new ConflictException("Phone number " + num + " is already in use by another account.");
                }
            }

            if (!request.phoneNumbers().isEmpty()) {
                boolean hasExplicitPrimary = request.phoneNumbers().stream()
                        .anyMatch(p -> Boolean.TRUE.equals(p.isPrimary()));

                String primaryPhone = null;
                boolean primaryAssigned = false;
                java.util.Map<String, Boolean> requestedNumberPrimaryMap = new java.util.LinkedHashMap<>();

                for (int i = 0; i < request.phoneNumbers().size(); i++) {
                    var phoneReq = request.phoneNumbers().get(i);
                    String cleanNum = phoneReq.phoneNumber().trim();
                    boolean isPrimary;
                    if (hasExplicitPrimary) {
                        isPrimary = Boolean.TRUE.equals(phoneReq.isPrimary()) && !primaryAssigned;
                        if (isPrimary) {
                            primaryAssigned = true;
                        }
                    } else {
                        isPrimary = (i == 0);
                    }

                    if (isPrimary) {
                        primaryPhone = cleanNum;
                    }
                    requestedNumberPrimaryMap.put(cleanNum, isPrimary);
                }

                // 1. Remove phone numbers that are no longer present in the request
                user.getPhoneNumbers().removeIf(existing -> !requestedNumberPrimaryMap.containsKey(existing.getPhoneNumber()));

                // 2. Update existing entries or add new ones
                for (java.util.Map.Entry<String, Boolean> entry : requestedNumberPrimaryMap.entrySet()) {
                    String num = entry.getKey();
                    Boolean isPrimary = entry.getValue();

                    Optional<UserPhoneNumber> existingOpt = user.getPhoneNumbers().stream()
                            .filter(p -> p.getPhoneNumber().equals(num))
                            .findFirst();

                    if (existingOpt.isPresent()) {
                        existingOpt.get().setIsPrimary(isPrimary);
                    } else {
                        UserPhoneNumber upn = UserPhoneNumber.builder()
                                .user(user)
                                .phoneNumber(num)
                                .isPrimary(isPrimary)
                                .build();
                        user.getPhoneNumbers().add(upn);
                    }
                }

                user.setPhoneNumber(primaryPhone);
            } else {
                user.getPhoneNumbers().clear();
                user.setPhoneNumber(null);
            }
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

        User user = null;
        if (username != null && !username.isBlank()) {
            try {
                UUID id = UUID.fromString(username.trim());
                user = userRepository.findById(id).orElse(null);
            } catch (IllegalArgumentException ignored) {
                // Not a UUID, look up by username
            }

            if (user == null) {
                user = userRepository
                        .findByUsernameIgnoreCase(username.trim())
                        .orElse(null);
            }
        }

        if (user == null || !Boolean.TRUE.equals(user.getPublicProfile()) || user.getStatus() != UserStatus.ACTIVE) {
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
                                if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
                                    String cleanPhone = request.phoneNumber().trim();
                                    boolean alreadyExists = existingUser.getPhoneNumbers().stream()
                                            .anyMatch(p -> p.getPhoneNumber().equalsIgnoreCase(cleanPhone));
                                    if (!alreadyExists && existingUser.getPhoneNumbers().size() < 3) {
                                        boolean isFirst = existingUser.getPhoneNumbers().isEmpty() || existingUser.getPhoneNumber() == null;
                                        UserPhoneNumber upn = UserPhoneNumber.builder()
                                                .user(existingUser)
                                                .phoneNumber(cleanPhone)
                                                .isPrimary(isFirst)
                                                .build();
                                        existingUser.getPhoneNumbers().add(upn);
                                        if (isFirst) {
                                            existingUser.setPhoneNumber(cleanPhone);
                                        }
                                    }
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

                            if (phoneNumber != null) {
                                UserPhoneNumber upn = UserPhoneNumber.builder()
                                        .user(newUser)
                                        .phoneNumber(phoneNumber)
                                        .isPrimary(true)
                                        .build();
                                newUser.getPhoneNumbers().add(upn);
                            }

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