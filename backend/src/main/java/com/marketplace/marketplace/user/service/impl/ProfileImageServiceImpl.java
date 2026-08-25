package com.marketplace.marketplace.user.service.impl;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.user.config.ProfileImageProperties;
import com.marketplace.marketplace.user.dto.request.RegisterProfileImageRequest;
import com.marketplace.marketplace.user.dto.response.ProfileImageResponse;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.enums.ProfileImageType;
import com.marketplace.marketplace.user.mapper.UserMapper;
import com.marketplace.marketplace.user.repository.UserRepository;
import com.marketplace.marketplace.user.service.ProfileImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileImageServiceImpl implements ProfileImageService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final UserRepository userRepository;
    private final ProfileImageProperties properties;
    private final SupabaseStorageService storageService;
    private final UserMapper userMapper;

    @Override
    public ProfileImageResponse registerImage(
            ProfileImageType type,
            RegisterProfileImageRequest request
    ) {
        User user = getAuthenticatedUser();
        validateRequest(request, user.getId());

        String previousStoragePath = type == ProfileImageType.AVATAR
                ? user.getAvatarUrl()
                : user.getCoverPhotoUrl();

        // Delete old file from storage if different
        if (previousStoragePath != null
                && !previousStoragePath.isBlank()
                && !previousStoragePath.equals(request.storagePath())
                && !previousStoragePath.startsWith("http://")
                && !previousStoragePath.startsWith("https://")) {
            try {
                storageService.delete(properties.getBucket(), previousStoragePath);
            } catch (Exception ignored) {
                // Log or ignore non-critical cleanup failures
            }
        }

        // Assign new image path
        if (type == ProfileImageType.AVATAR) {
            user.setAvatarUrl(request.storagePath());
        } else {
            user.setCoverPhotoUrl(request.storagePath());
        }

        User savedUser = userRepository.save(user);
        UserResponse userResponse = userMapper.toResponse(savedUser);

        String publicUrl = storageService.getPublicUrl(
                properties.getBucket(),
                request.storagePath()
        );

        return new ProfileImageResponse(
                type,
                request.storagePath(),
                publicUrl,
                userResponse
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileImageResponse getImage(ProfileImageType type) {
        User user = getAuthenticatedUser();
        String storagePath = type == ProfileImageType.AVATAR
                ? user.getAvatarUrl()
                : user.getCoverPhotoUrl();

        String publicUrl = storagePath != null
                ? storageService.getPublicUrl(properties.getBucket(), storagePath)
                : null;

        return new ProfileImageResponse(
                type,
                storagePath,
                publicUrl,
                userMapper.toResponse(user)
        );
    }

    @Override
    public void deleteImage(ProfileImageType type) {
        User user = getAuthenticatedUser();
        String currentStoragePath = type == ProfileImageType.AVATAR
                ? user.getAvatarUrl()
                : user.getCoverPhotoUrl();

        if (currentStoragePath != null && !currentStoragePath.isBlank()) {
            if (!currentStoragePath.startsWith("http://") && !currentStoragePath.startsWith("https://")) {
                try {
                    storageService.delete(properties.getBucket(), currentStoragePath);
                } catch (Exception ignored) {
                    // Log or ignore non-critical cleanup failures
                }
            }

            if (type == ProfileImageType.AVATAR) {
                user.setAvatarUrl(null);
            } else {
                user.setCoverPhotoUrl(null);
            }

            userRepository.save(user);
        }
    }

    private User getAuthenticatedUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void validateRequest(RegisterProfileImageRequest request, UUID userId) {
        if (!ALLOWED_MIME_TYPES.contains(request.mimeType().toLowerCase())) {
            throw new ConflictException("Unsupported image type: " + request.mimeType() + ". Allowed types are JPEG, PNG and WebP.");
        }

        if (request.fileSize() > properties.getMaxFileSize()) {
            throw new ConflictException("Image exceeds the maximum allowed size of " + (properties.getMaxFileSize() / (1024 * 1024)) + "MB.");
        }

        String expectedPrefix = "users/" + userId + "/";
        if (!request.storagePath().startsWith(expectedPrefix)) {
            throw new ConflictException("Invalid image storage path. Path must start with '" + expectedPrefix + "'.");
        }

        if (request.storagePath().contains("..")) {
            throw new ConflictException("Invalid image storage path.");
        }
    }
}
