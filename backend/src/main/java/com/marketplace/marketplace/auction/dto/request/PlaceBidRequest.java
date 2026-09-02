package com.marketplace.marketplace.auction.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlaceBidRequest(
        @NotNull @DecimalMin(value = "0.01", message = "Bid amount must be greater than zero.") BigDecimal amount) {
}
