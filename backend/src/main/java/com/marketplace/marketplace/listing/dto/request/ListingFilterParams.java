package com.marketplace.marketplace.listing.dto.request;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.PricingType;

import java.math.BigDecimal;

public record ListingFilterParams(
        String search,
        ListingCondition condition,
        PricingType pricingType,
        ListingType listingType,
        BigDecimal minPrice,
        BigDecimal maxPrice
) {
}
