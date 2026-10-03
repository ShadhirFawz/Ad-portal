package com.marketplace.marketplace.membership.dto;

import com.marketplace.marketplace.membership.entity.SellerMembership;
import com.marketplace.marketplace.membership.enums.BillingCycle;
import com.marketplace.marketplace.membership.enums.MembershipStatus;
import com.marketplace.marketplace.membership.enums.PlanTier;

import java.time.OffsetDateTime;
import java.util.UUID;

public record SellerMembershipResponse(
        UUID id,
        UUID userId,
        UUID rootCategoryId,
        String rootCategoryName,
        PlanTier planTier,
        BillingCycle billingCycle,
        MembershipStatus status,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        Integer listingLimit,
        Integer listingsUsed,
        Integer remainingListings,
        Integer spotlightCreditsTotal,
        Integer spotlightCreditsUsed,
        Integer remainingSpotlights,
        Integer pushUpCreditsTotal,
        Integer pushUpCreditsUsed,
        Integer remainingPushUps,
        Integer urgentCreditsTotal,
        Integer urgentCreditsUsed,
        Integer remainingUrgents,
        String businessName,
        String businessEmail,
        String businessPhone,
        String bio,
        Boolean isActive
) {
    public static SellerMembershipResponse fromEntity(SellerMembership membership) {
        int remainingListings = Math.max(0, membership.getListingLimit() - (membership.getListingsUsed() != null ? membership.getListingsUsed() : 0));
        int remainingSpotlights = Math.max(0, membership.getSpotlightCreditsTotal() - (membership.getSpotlightCreditsUsed() != null ? membership.getSpotlightCreditsUsed() : 0));
        int remainingPushUps = Math.max(0, membership.getPushUpCreditsTotal() - (membership.getPushUpCreditsUsed() != null ? membership.getPushUpCreditsUsed() : 0));
        int remainingUrgents = Math.max(0, membership.getUrgentCreditsTotal() - (membership.getUrgentCreditsUsed() != null ? membership.getUrgentCreditsUsed() : 0));

        return new SellerMembershipResponse(
                membership.getId(),
                membership.getUser() != null ? membership.getUser().getId() : null,
                membership.getRootCategory() != null ? membership.getRootCategory().getId() : null,
                membership.getRootCategory() != null ? membership.getRootCategory().getName() : null,
                membership.getPlanTier(),
                membership.getBillingCycle(),
                membership.getStatus(),
                membership.getStartDate(),
                membership.getEndDate(),
                membership.getListingLimit(),
                membership.getListingsUsed(),
                remainingListings,
                membership.getSpotlightCreditsTotal(),
                membership.getSpotlightCreditsUsed(),
                remainingSpotlights,
                membership.getPushUpCreditsTotal(),
                membership.getPushUpCreditsUsed(),
                remainingPushUps,
                membership.getUrgentCreditsTotal(),
                membership.getUrgentCreditsUsed(),
                remainingUrgents,
                membership.getBusinessName(),
                membership.getBusinessEmail(),
                membership.getBusinessPhone(),
                membership.getBio(),
                membership.isActive()
        );
    }
}
