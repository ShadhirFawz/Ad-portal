package com.marketplace.marketplace.listing.dto.request;

import jakarta.validation.constraints.*;

import java.util.Map;

public record RegisterListingImageRequest(

        @NotBlank @Size(max = 500) String storagePath,

        @Size(max = 255) String fileName,

        @NotBlank @Size(max = 100) String mimeType,

        @NotNull @Positive Long fileSize,

        @Positive Integer width,

        @Positive Integer height,

        Map<String, Object> metadata

) {
}