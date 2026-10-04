package com.marketplace.marketplace.membership.dto;

import com.marketplace.marketplace.user.dto.request.UserOpeningHourRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;
import java.util.UUID;

public record InitiateMembershipRequest(
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

        @Pattern(regexp = "^(?=.{3,30}$)(?![_-])(?!.*[_-]{2})[a-zA-Z0-9_-]+(?<![_-])$", message = "Username must be 3-30 characters with letters, numbers, underscores, or hyphens")
        String username,

        String bio,

        List<UserOpeningHourRequest> openingHours
) {
}
