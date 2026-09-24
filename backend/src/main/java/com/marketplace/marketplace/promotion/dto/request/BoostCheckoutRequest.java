package com.marketplace.marketplace.promotion.dto.request;

import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostType;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BoostCheckoutRequest(
        @NotNull(message = "Listing ID is required")
        UUID listingId,

        @NotNull(message = "Boost type is required")
        BoostType boostType,

        @NotNull(message = "Duration is required")
        BoostDuration duration,

        OffsetDateTime scheduledStartTime
) {
}
