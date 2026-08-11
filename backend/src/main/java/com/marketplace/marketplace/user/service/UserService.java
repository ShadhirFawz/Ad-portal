package com.marketplace.marketplace.user.service;

import java.util.Optional;
import java.util.UUID;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.dto.request.ChangePasswordRequest;
import com.marketplace.marketplace.user.dto.request.UpdateProfileRequest;
import com.marketplace.marketplace.user.entity.User;

public interface UserService {

    User save(User user);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByUsername(String username);

    Optional<User> findById(UUID id);

    UserResponse getCurrentUser();

    UserResponse updateCurrentUser(
            UpdateProfileRequest request);

    UserResponse getPublicProfile(String username);

    void changePassword(
            ChangePasswordRequest request);

    void deleteCurrentUser();

}