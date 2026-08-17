package com.marketplace.marketplace.listing.dto.response;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ListingImageResponse(

        UUID id,

        UUID listingId,

        String storagePath,

        String url,

        String fileName,

        String mimeType,

        Long fileSize,

        Integer width,

        Integer height,

        Integer displayOrder,

        boolean primary,

        Map<String, Object> metadata,

        OffsetDateTime createdAt

) {
}