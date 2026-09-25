package com.marketplace.marketplace.user.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UserOpeningHourRequest(

        @NotNull(message = "Day of week is required")
        @Min(value = 1, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
        @Max(value = 7, message = "Day of week must be between 1 (Monday) and 7 (Sunday)")
        Integer dayOfWeek,

        @NotNull(message = "Closed flag is required")
        Boolean isClosed,

        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$", message = "Open time must be in HH:mm format")
        String openTime,

        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$", message = "Close time must be in HH:mm format")
        String closeTime
) {
}
