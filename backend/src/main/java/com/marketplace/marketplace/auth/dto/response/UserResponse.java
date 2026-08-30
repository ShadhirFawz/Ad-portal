package com.marketplace.marketplace.auth.dto.response;

import com.marketplace.marketplace.common.enums.Role;
import com.marketplace.marketplace.common.enums.UserStatus;
import com.marketplace.marketplace.user.dto.response.UserPhoneNumberResponse;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UserResponse(

        UUID id,

        String firstName,

        String lastName,

        String username,

        String email,

        String phoneNumber,

        List<UserPhoneNumberResponse> phoneNumbers,

        String avatarUrl,

        String coverPhotoUrl,

        String bio,

        String location,

        Role role,

        UserStatus status,

        Boolean emailVerified,

        Boolean phoneVerified,

        Boolean publicProfile,

        OffsetDateTime createdAt

) {
}