package com.marketplace.marketplace.listing.dto.response;

import com.marketplace.marketplace.category.dto.response.CategoryBreadcrumbResponse;
import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.ModerationStatus;
import com.marketplace.marketplace.listing.enums.PricingType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ListingResponse(

        UUID id,

        UUID sellerId,

        String sellerUsername,

        UUID categoryId,

        String categoryName,

        List<CategoryBreadcrumbResponse> categoryBreadcrumbs,

        String title,

        String description,

        BigDecimal price,

        String currency,

        PricingType pricingType,

        boolean negotiable,

        BigDecimal minimumOfferPrice,

        ListingType listingType,

        ListingCondition condition,

        Integer quantity,

        Integer availableQuantity,

        ListingLocationType locationType,

        String district,

        String province,

        String city,

        String postalCode,

        Map<String, Object> customAttributes,

        ListingStatus status,

        ModerationStatus moderationStatus,

        long viewCount,

        long favoriteCount,

        List<ListingImageResponse> images,

        OffsetDateTime publishedAt,

        OffsetDateTime createdAt,

        OffsetDateTime updatedAt,

        String sellerPhoneNumber

) {
}