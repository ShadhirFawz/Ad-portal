package com.marketplace.marketplace.auction.dto.response;

import java.util.UUID;

public record AuctionBidderPreview(UUID bidderId, String avatarUrl, String initial) {
}
