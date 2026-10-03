package com.marketplace.marketplace.membership.dto;

import com.marketplace.marketplace.membership.entity.MembershipPricingPlan;
import com.marketplace.marketplace.membership.enums.BillingCycle;
import com.marketplace.marketplace.membership.enums.PlanTier;

import java.math.BigDecimal;
import java.util.UUID;

public record MembershipPricingPlanResponse(
        UUID id,
        UUID rootCategoryId,
        String rootCategoryName,
        PlanTier planTier,
        BillingCycle billingCycle,
        Integer durationDays,
        BigDecimal basePrice,
        Integer listingLimit,
        Integer bonusSpotlightCount,
        Integer bonusPushUpCount,
        Integer bonusUrgentCount,
        Boolean isActive
) {
    public static MembershipPricingPlanResponse fromEntity(MembershipPricingPlan plan) {
        return new MembershipPricingPlanResponse(
                plan.getId(),
                plan.getRootCategory() != null ? plan.getRootCategory().getId() : null,
                plan.getRootCategory() != null ? plan.getRootCategory().getName() : null,
                plan.getPlanTier(),
                plan.getBillingCycle(),
                plan.getDurationDays(),
                plan.getBasePrice(),
                plan.getListingLimit(),
                plan.getBonusSpotlightCount(),
                plan.getBonusPushUpCount(),
                plan.getBonusUrgentCount(),
                plan.getIsActive()
        );
    }
}
