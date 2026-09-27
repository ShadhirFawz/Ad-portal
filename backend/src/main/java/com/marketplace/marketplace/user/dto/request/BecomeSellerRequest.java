package com.marketplace.marketplace.user.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BecomeSellerRequest(
        @NotBlank(message = "Phone number is required to become a seller.")
        @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Please provide a valid phone number.")
        String phoneNumber,

        @AssertTrue(message = "You must accept the Seller Terms of Service to continue.")
        Boolean acceptTerms,

        Boolean isWhatsapp,

        String preferredContactMethod
) {
}
