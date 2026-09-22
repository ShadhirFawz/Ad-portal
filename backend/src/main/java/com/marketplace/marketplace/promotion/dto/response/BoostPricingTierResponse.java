package com.marketplace.marketplace.promotion.dto.response;

import com.marketplace.marketplace.promotion.enums.BoostDuration;

import java.math.BigDecimal;
import java.util.UUID;

public record BoostPricingTierResponse(
        UUID id,
        BoostDuration duration,
        int durationDays,
        BigDecimal basePrice,
        BigDecimal discountPercentage,
        BigDecimal discountAmount,
        BigDecimal priceAfterDiscount,
        BigDecimal taxPercentage,
        BigDecimal taxAmount,
        BigDecimal finalPrice,
        boolean isActive
) {
}
