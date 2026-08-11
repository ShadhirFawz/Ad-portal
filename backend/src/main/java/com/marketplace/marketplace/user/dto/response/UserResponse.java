package com.marketplace.marketplace.user.dto.response;

import com.marketplace.marketplace.common.enums.Role;
import com.marketplace.marketplace.common.enums.UserStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponse(

        UUID id,

        String firstName,

        String lastName,

        String username,

        String email,

        String phoneNumber,

        String avatarUrl,

        String coverPhotoUrl,

        String bio,

        String location,

        Role role,

        UserStatus status,

        boolean emailVerified,

        boolean phoneVerified,

        boolean publicProfile,

        OffsetDateTime createdAt

) {
}