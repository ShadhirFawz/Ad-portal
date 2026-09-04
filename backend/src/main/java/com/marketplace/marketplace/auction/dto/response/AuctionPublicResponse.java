package com.marketplace.marketplace.auction.dto.response;

import com.marketplace.marketplace.auction.enums.AuctionStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AuctionPublicResponse(
        UUID id,
        UUID listingId,
        AuctionStatus status,
        OffsetDateTime startedAt,
        OffsetDateTime endsAt,
        BigDecimal currentHighestBid,
        long participantCount,
        List<AuctionBidderPreview> latestBidders,
        boolean hasEnded,
        boolean userHasBid,
        BigDecimal userCurrentBid) {
}
