package com.marketplace.marketplace.listing.dto.response;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ListingResponse(

        UUID id,

        UUID sellerId,

        String sellerUsername,

        UUID categoryId,

        String categoryName,

        String title,

        String description,

        BigDecimal price,

        String currency,

        ListingCondition condition,

        String location,

        ListingStatus status,

        long viewCount,

        long favoriteCount,

        OffsetDateTime publishedAt,

        OffsetDateTime createdAt,

        OffsetDateTime updatedAt

) {
}