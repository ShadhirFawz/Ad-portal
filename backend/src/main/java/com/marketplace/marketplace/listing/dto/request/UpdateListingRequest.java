package com.marketplace.marketplace.listing.dto.request;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.PricingType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateListingRequest(

        UUID categoryId,

        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters") String title,

        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters") String description,

        @DecimalMin(value = "0.00", message = "Price cannot be negative") @Digits(integer = 12, fraction = 2, message = "Invalid price") BigDecimal price,

        PricingType pricingType,

        Boolean negotiable,

        @DecimalMin(value = "0.00", message = "Minimum offer price cannot be negative") @Digits(integer = 12, fraction = 2) BigDecimal minimumOfferPrice,

        ListingCondition condition,

        @Size(max = 150) String location

) {
}