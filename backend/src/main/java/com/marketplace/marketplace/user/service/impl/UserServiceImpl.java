package com.marketplace.marketplace.user.service.impl;

import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

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
    public boolean existsByUsername(String username) {
        return username != null && !username.isBlank() && userRepository.existsByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }
}