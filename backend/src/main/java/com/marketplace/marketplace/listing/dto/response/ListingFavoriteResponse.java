package com.marketplace.marketplace.listing.dto.response;

import java.util.UUID;

public record ListingFavoriteResponse(
        UUID listingId,
        boolean isFavorited,
        long favoriteCount
) {
}
