package com.marketplace.marketplace.listing.dto.response;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.PricingType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ListingCardResponse(
        UUID id,
        UUID sellerId,
        String sellerUsername,
        UUID categoryId,
        String categoryName,
        String title,
        BigDecimal price,
        String currency,
        PricingType pricingType,
        boolean negotiable,
        ListingType listingType,
        ListingCondition condition,
        ListingLocationType locationType,
        String district,
        String province,
        String city,
        ListingStatus status,
        ListingCardImageResponse primaryImage,
        long viewCount,
        long favoriteCount,
        OffsetDateTime publishedAt,
        OffsetDateTime createdAt
) {
}
