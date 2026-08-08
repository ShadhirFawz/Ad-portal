package com.marketplace.marketplace.user.service;

import java.util.Optional;
import java.util.UUID;

import com.marketplace.marketplace.user.entity.User;

public interface UserService {

    User save(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByUsername(String username);

    Optional<User> findById(UUID id);

}