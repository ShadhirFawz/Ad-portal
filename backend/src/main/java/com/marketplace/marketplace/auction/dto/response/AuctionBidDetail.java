package com.marketplace.marketplace.auction.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AuctionBidDetail(
        UUID bidId,
        UUID bidderId,
        String bidderFirstName,
        String bidderLastName,
        String bidderUsername,
        String bidderAvatarUrl,
        BigDecimal amount,
        OffsetDateTime placedAt,
        boolean isWinning) {
}
