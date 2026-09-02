package com.marketplace.marketplace.auction.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PlaceBidResponse(
        UUID bidId,
        BigDecimal amount,
        BigDecimal currentHighestBid,
        boolean isWinning) {
}
