package com.marketplace.marketplace.auth.controller;

import com.marketplace.marketplace.auth.dto.request.LoginRequest;
import com.marketplace.marketplace.auth.dto.request.RefreshTokenRequest;
import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.request.VerifyEmailRequest;
import com.marketplace.marketplace.auth.dto.response.AuthResponse;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.auth.service.EmailVerificationService;
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
        private final EmailVerificationService emailVerificationService;

        @PostMapping("/register")
        @SecurityRequirements
        @Operation(summary = "Register a new user", description = "Creates a new user account. Returns the created user profile on success.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User registered successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error or duplicate email", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<UserResponse> register(
                        @Valid @RequestBody RegisterRequest request) {

                return ApiResponse.success(
                                "Registration successful.",
                                authService.register(request));
        }

        @PostMapping("/login")
        @SecurityRequirements
        @Operation(summary = "Login a user", description = "Authenticates a user and returns an authentication token.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid email or password", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<AuthResponse> login(
                        @Valid @RequestBody LoginRequest request) {

                return ApiResponse.success(
                                "Login successful.",
                                authService.login(request));
        }

        @PostMapping("/verify-email")
        public ApiResponse<Void> verifyEmail(
                        @Valid @RequestBody VerifyEmailRequest request) {

                emailVerificationService.verify(request);

                return ApiResponse.success(
                                "Email verified successfully.",
                                null);
        }

        @PostMapping("/refresh")
        @SecurityRequirements
        @Operation(summary = "Refresh authentication token", description = "Refreshes the authentication token using a valid refresh token.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or revoked refresh token", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<AuthResponse> refresh(
                        @Valid @RequestBody RefreshTokenRequest request) {

                return ApiResponse.success(
                                "Token refreshed successfully.",
                                authService.refresh(request));
        }

        @PostMapping("/logout")
        @SecurityRequirements
        @Operation(summary = "Logout a user", description = "Logs out the user by revoking the provided refresh token.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid refresh token", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<Void> logout(
                        @Valid @RequestBody RefreshTokenRequest request) {

                authService.logout(request);

                return ApiResponse.success(
                                "Logout successful.",
                                null);
        }

        @PostMapping("/logout-all")
        @SecurityRequirements
        @Operation(summary = "Logout from all devices", description = "Logs out the user from all devices by revoking all refresh tokens.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logged out from all devices successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<Void> logoutAll() {

                authService.logoutAll();

                return ApiResponse.success(
                                "Logged out from all devices.",
                                null);
        }

        @GetMapping("/me")
        @SecurityRequirements
        @Operation(summary = "Get current user profile", description = "Retrieves the profile of the currently authenticated user.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<UserResponse> me() {

                return ApiResponse.success(
                                "User retrieved successfully.",
                                authService.me());
        }

}