package com.marketplace.marketplace.promotion.dto.response;

import com.marketplace.marketplace.promotion.enums.BoostStatus;
import com.marketplace.marketplace.promotion.enums.BoostType;
import com.marketplace.marketplace.promotion.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AdBoostResponse(
        UUID id,
        UUID listingId,
        String listingTitle,
        String listingSlug,
        BoostType boostType,
        BoostStatus boostStatus,
        int durationDays,
        OffsetDateTime startsAt,
        OffsetDateTime expiresAt,
        OffsetDateTime activatedAt,
        OffsetDateTime createdAt,
        UUID paymentId,
        String orderId,
        String payherePaymentId,
        BigDecimal amount,
        String currency,
        PaymentStatus paymentStatus,
        String paymentMethod
) {
}

