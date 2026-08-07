package com.marketplace.marketplace.auth.controller;

import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ApiResponse.success(
                "Registration successful.",
                authService.register(request));
    }
}