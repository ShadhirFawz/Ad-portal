package com.marketplace.marketplace.user.mapper;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private static final String PROFILE_BUCKET = "profile-images";
    private final SupabaseStorageService storageService;

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        String avatarUrl = resolveImageUrl(user.getAvatarUrl());
        String coverPhotoUrl = resolveImageUrl(user.getCoverPhotoUrl());

        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                avatarUrl,
                coverPhotoUrl,
                user.getBio(),
                user.getLocation(),
                user.getRole(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getPhoneVerified(),
                user.getPublicProfile(),
                user.getCreatedAt()
        );
    }

    private String resolveImageUrl(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }
        if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
            return storagePath;
        }
        return storageService.getPublicUrl(PROFILE_BUCKET, storagePath);
    }
}