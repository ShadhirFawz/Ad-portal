package com.marketplace.marketplace.auth.service.impl;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.exception.AuthenticationException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.user.mapper.UserMapper;
import com.marketplace.marketplace.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

        private final UserService userService;
        private final UserMapper userMapper;

        @Override
        @Transactional(readOnly = true)
        public UserResponse me() {

                UUID userId = SecurityUtils.getCurrentUserId();

                return userMapper.toResponse(
                                userService.findById(userId)
                                                .orElseThrow(() -> new AuthenticationException(
                                                                "User not found.")));
        }
}