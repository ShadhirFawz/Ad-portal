package com.marketplace.marketplace.user.controller;

import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.user.dto.request.ChangePasswordRequest;
import com.marketplace.marketplace.user.dto.request.UpdateProfileRequest;
import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe() {

        return ApiResponse.success(
                "Profile retrieved successfully.",
                userService.getCurrentUser());
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            @Valid @RequestBody UpdateProfileRequest request) {

        return ApiResponse.success(
                "Profile updated successfully.",
                userService.updateCurrentUser(request));
    }

    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        return ApiResponse.success(
                "Password changed successfully.",
                null);
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMe() {

        userService.deleteCurrentUser();

        return ApiResponse.success(
                "Account deleted successfully.",
                null);
    }

    @GetMapping("/{username}")
    public ApiResponse<UserResponse> getPublicProfile(
            @PathVariable String username) {

        return ApiResponse.success(
                "Profile retrieved successfully.",
                userService.getPublicProfile(username));
    }
}