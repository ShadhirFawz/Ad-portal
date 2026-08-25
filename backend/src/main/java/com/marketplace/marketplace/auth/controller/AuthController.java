package com.marketplace.marketplace.auth.controller;

import com.marketplace.marketplace.auth.dto.request.SyncUserRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.auth.service.AuthService;
import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.common.response.ErrorResponse;
import com.marketplace.marketplace.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth endpoints backed by Supabase session tokens")
public class AuthController {

        private final AuthService authService;
        private final UserService userService;

        @GetMapping("/me")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(
                summary = "Get current user profile",
                description = "Returns the backend profile for the currently authenticated Supabase user.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                                responseCode = "200",
                                description = "User profile retrieved successfully",
                                content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                                responseCode = "401",
                                description = "Unauthorized",
                                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<UserResponse> me() {
                return ApiResponse.success(
                                "User retrieved successfully.",
                                authService.me());
        }

        @PostMapping("/sync")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(
                summary = "Sync / upsert Supabase user into local DB",
                description = "Called after sign-up or sign-in to ensure the Supabase user has a corresponding "
                                + "local profile. Creates one if it doesn't exist yet; returns the existing one otherwise.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                                responseCode = "200",
                                description = "Profile synced successfully",
                                content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                                responseCode = "401",
                                description = "Unauthorized",
                                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ApiResponse<UserResponse> sync(
                        @Valid @RequestBody(required = false) SyncUserRequest request) {

                return ApiResponse.success(
                                "Profile synced successfully.",
                                userService.syncCurrentUser(request));
        }
}