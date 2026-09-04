package com.marketplace.marketplace.listing.dto.response;

import java.util.UUID;

public record ListingBookmarkResponse(
        UUID listingId,
        boolean isBookmarked
) {
}
