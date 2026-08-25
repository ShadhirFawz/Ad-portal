package com.marketplace.marketplace.user.dto.response;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.enums.ProfileImageType;

public record ProfileImageResponse(

        ProfileImageType imageType,

        String storagePath,

        String url,

        UserResponse user

) {
}
