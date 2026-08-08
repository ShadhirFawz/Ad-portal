package com.marketplace.marketplace.auth.service;

import com.marketplace.marketplace.auth.dto.request.LoginRequest;
import com.marketplace.marketplace.auth.dto.request.RefreshTokenRequest;
import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.response.AuthResponse;
import com.marketplace.marketplace.auth.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    void logoutAll();

    UserResponse me();

}