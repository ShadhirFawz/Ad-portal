package com.marketplace.marketplace.listing.dto.request;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.PricingType;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record CreateListingRequest(

                @NotNull(message = "Category is required") UUID categoryId,

                @NotBlank(message = "Title is required") @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters") String title,

                @NotBlank(message = "Description is required") @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters") String description,

                @DecimalMin(value = "0.00", message = "Price cannot be negative") @Digits(integer = 12, fraction = 2, message = "Invalid price") BigDecimal price,

                @NotNull(message = "Pricing type is required") PricingType pricingType,

                ListingType listingType,

                Boolean negotiable,

                @DecimalMin(value = "0.00", message = "Minimum offer price cannot be negative") @Digits(integer = 12, fraction = 2) BigDecimal minimumOfferPrice,

                @NotNull(message = "Condition is required") ListingCondition condition,

                @Min(value = 1, message = "Quantity must be at least 1") Integer quantity,

                ListingLocationType locationType,

                @Size(max = 100) String district,

                @Size(max = 100) String province,

                @Size(max = 100) String city,

                @Size(max = 20) String postalCode,

                Map<String, Object> customAttributes

) {
}