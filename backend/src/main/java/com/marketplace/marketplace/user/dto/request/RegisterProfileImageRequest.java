package com.marketplace.marketplace.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RegisterProfileImageRequest(

        @NotBlank(message = "Storage path is required")
        @Size(max = 500, message = "Storage path must not exceed 500 characters")
        String storagePath,

        @Size(max = 255, message = "File name must not exceed 255 characters")
        String fileName,

        @NotBlank(message = "MIME type is required")
        @Size(max = 100, message = "MIME type must not exceed 100 characters")
        String mimeType,

        @NotNull(message = "File size is required")
        @Positive(message = "File size must be greater than zero")
        Long fileSize,

        @Positive(message = "Width must be positive")
        Integer width,

        @Positive(message = "Height must be positive")
        Integer height

) {
}
