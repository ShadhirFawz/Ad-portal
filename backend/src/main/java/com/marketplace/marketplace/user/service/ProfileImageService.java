package com.marketplace.marketplace.user.service;

import com.marketplace.marketplace.user.dto.request.RegisterProfileImageRequest;
import com.marketplace.marketplace.user.dto.response.ProfileImageResponse;
import com.marketplace.marketplace.user.enums.ProfileImageType;

public interface ProfileImageService {

    ProfileImageResponse registerImage(
            ProfileImageType type,
            RegisterProfileImageRequest request
    );

    ProfileImageResponse getImage(
            ProfileImageType type
    );

    void deleteImage(
            ProfileImageType type
    );
}
