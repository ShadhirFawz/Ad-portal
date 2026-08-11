package com.marketplace.marketplace.auth.controller;

import com.marketplace.marketplace.auth.dto.request.ForgotPasswordRequest;
import com.marketplace.marketplace.auth.dto.request.LoginRequest;
import com.marketplace.marketplace.auth.dto.request.RefreshTokenRequest;
import com.marketplace.marketplace.auth.dto.request.RegisterRequest;
import com.marketplace.marketplace.auth.dto.request.ResetPasswordRequest;
import com.marketplace.marketplace.auth.dto.request.VerifyEmailRequest;
import com.marketplace.marketplace.auth.dto.response.AuthResponse;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.auth.service.EmailVerificationService;
import com.marketplace.marketplace.auth.service.PasswordResetService;
import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.common.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
        private final PasswordResetService passwordResetService;

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
        @SecurityRequirements
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
        @SecurityRequirement(name = "bearerAuth")
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
        @SecurityRequirement(name = "bearerAuth")
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

        @PostMapping("/forgot-password")
        @SecurityRequirements
        @Operation(summary = "Request password reset", description = "Initiates a password reset process by sending a reset link to the user's email if the account exists.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset instructions sent if the account exists", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<Void> forgotPassword(
                        @Valid @RequestBody ForgotPasswordRequest request) {

                passwordResetService.requestReset(request);

                return ApiResponse.success(
                                "If the account exists, password reset instructions have been sent.",
                                null);
        }

        @PostMapping("/reset-password")
        @SecurityRequirements
        @Operation(summary = "Reset password", description = "Resets the user's password using a valid password reset token.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successful", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired password reset token", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<Void> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {

                passwordResetService.reset(request);

                return ApiResponse.success(
                                "Password reset successful.",
                                null);
        }

}