package com.marketplace.marketplace.listing.dto.request;

import jakarta.validation.constraints.*;

import java.util.Map;

public record RegisterListingImageRequest(

        @NotBlank @Size(max = 2000) String storagePath,

        @Size(max = 500) String fileName,

        @Size(max = 100) String mimeType,

        @PositiveOrZero Long fileSize,

        @Positive Integer width,

        @Positive Integer height,

        Map<String, Object> metadata

) {
}