package com.marketplace.marketplace.auth.service;

import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

}