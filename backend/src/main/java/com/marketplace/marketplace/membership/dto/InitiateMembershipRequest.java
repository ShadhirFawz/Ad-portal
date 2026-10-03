package com.marketplace.marketplace.membership.dto;

import com.marketplace.marketplace.user.dto.request.UserOpeningHourRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record InitiateMembershipRequest(
        @NotNull(message = "Root category ID is required")
        UUID rootCategoryId,

        @NotNull(message = "Pricing plan ID is required")
        UUID pricingPlanId,

        @NotBlank(message = "Business name is required")
        String businessName,

        @NotBlank(message = "Business email is required")
        @Email(message = "Invalid business email format")
        String businessEmail,

        @NotBlank(message = "Business phone number is required")
        String businessPhone,

        String bio,

        List<UserOpeningHourRequest> openingHours
) {
}
