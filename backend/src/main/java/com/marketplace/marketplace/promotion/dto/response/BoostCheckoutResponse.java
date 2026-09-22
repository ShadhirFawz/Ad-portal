package com.marketplace.marketplace.promotion.dto.response;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record BoostCheckoutResponse(
        UUID boostSubscriptionId,
        UUID paymentId,
        String orderId,
        BigDecimal amount,
        String currency,
        String payHereCheckoutUrl,
        Map<String, String> payHereParams
) {
}
