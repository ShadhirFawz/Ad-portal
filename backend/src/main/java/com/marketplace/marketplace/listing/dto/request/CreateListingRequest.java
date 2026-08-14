package com.marketplace.marketplace.listing.dto.request;

import com.marketplace.marketplace.listing.enums.ListingCondition;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateListingRequest(

        @NotNull(message = "Category is required") UUID categoryId,

        @NotBlank(message = "Title is required") @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters") String title,

        @NotBlank(message = "Description is required") @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters") String description,

        @NotNull(message = "Price is required") @DecimalMin(value = "0.00", message = "Price cannot be negative") @Digits(integer = 12, fraction = 2, message = "Invalid price") BigDecimal price,

        @NotNull(message = "Condition is required") ListingCondition condition,

        @Size(max = 150, message = "Location must not exceed 150 characters") String location

) {
}