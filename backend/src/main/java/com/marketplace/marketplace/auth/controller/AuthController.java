package com.marketplace.marketplace.auth.controller;

import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.common.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @SecurityRequirements  // No auth required for this endpoint
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account. Returns the created user profile on success."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Validation error or duplicate email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ApiResponse<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ApiResponse.success(
                "Registration successful.",
                authService.register(request));
    }
}