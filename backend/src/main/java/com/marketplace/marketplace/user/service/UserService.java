package com.marketplace.marketplace.user.service;

import com.marketplace.marketplace.user.entity.User;

public interface UserService {

    User save(User user);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByUsername(String username);

}