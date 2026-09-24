package com.marketplace.marketplace.promotion.dto.response;

import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record BoostPlanResponse(
        BoostType boostType,
        String name,
        String badgeText,
        String description,
        List<String> highlights,
        String badgeColor,
        Map<BoostDuration, BigDecimal> pricing,
        List<BoostPricingTierResponse> pricingTiers
) {
}
