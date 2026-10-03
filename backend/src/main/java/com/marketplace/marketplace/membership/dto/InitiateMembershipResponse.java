package com.marketplace.marketplace.membership.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record InitiateMembershipResponse(
        UUID membershipId,
        String orderId,
        BigDecimal amount,
        String currency,
        String merchantId,
        String hash,
        String planTier,
        String billingCycle,
        String rootCategoryName,
        String payHereCheckoutUrl,
        Map<String, String> payHereParams
) {
}
