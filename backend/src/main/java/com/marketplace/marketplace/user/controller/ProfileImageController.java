package com.marketplace.marketplace.user.controller;

import com.marketplace.marketplace.user.dto.request.RegisterProfileImageRequest;
import com.marketplace.marketplace.user.dto.response.ProfileImageResponse;
import com.marketplace.marketplace.user.enums.ProfileImageType;
import com.marketplace.marketplace.user.service.ProfileImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me/images")
@RequiredArgsConstructor
@Tag(name = "User Profile Images", description = "Endpoints for managing user avatar and cover photo")
@SecurityRequirement(name = "bearerAuth")
public class ProfileImageController {

    private final ProfileImageService profileImageService;

    @PostMapping("/{type}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register profile image", description = "Registers an uploaded avatar or cover photo for the current user")
    public ProfileImageResponse registerImage(
            @PathVariable String type,
            @Valid @RequestBody RegisterProfileImageRequest request
    ) {
        ProfileImageType imageType = ProfileImageType.fromString(type);
        return profileImageService.registerImage(imageType, request);
    }

    @GetMapping("/{type}")
    @Operation(summary = "Get profile image", description = "Retrieves the current avatar or cover photo details for the current user")
    public ProfileImageResponse getImage(
            @PathVariable String type
    ) {
        ProfileImageType imageType = ProfileImageType.fromString(type);
        return profileImageService.getImage(imageType);
    }

    @DeleteMapping("/{type}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete profile image", description = "Deletes the avatar or cover photo for the current user and removes it from storage")
    public void deleteImage(
            @PathVariable String type
    ) {
        ProfileImageType imageType = ProfileImageType.fromString(type);
        profileImageService.deleteImage(imageType);
    }
}
