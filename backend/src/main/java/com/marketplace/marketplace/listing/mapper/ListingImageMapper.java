package com.marketplace.marketplace.listing.mapper;

import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.listing.config.ListingImageProperties;
import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.entity.ListingImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingImageMapper {

    private final ListingImageProperties properties;
    private final SupabaseStorageService storageService;

    public ListingImageResponse toResponse(
            ListingImage image
    ) {
        return new ListingImageResponse(
                image.getId(),
                image.getListing().getId(),
                image.getStoragePath(),
                storageService.getPublicUrl(
                        properties.getBucket(),
                        image.getStoragePath()
                ),
                image.getFileName(),
                image.getMimeType(),
                image.getFileSize(),
                image.getWidth(),
                image.getHeight(),
                image.getDisplayOrder(),
                image.isPrimary(),
                image.getMetadata(),
                image.getCreatedAt()
        );
    }
}
