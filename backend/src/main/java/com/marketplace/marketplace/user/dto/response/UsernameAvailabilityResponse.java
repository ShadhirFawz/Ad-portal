package com.marketplace.marketplace.user.dto.response;

public record UsernameAvailabilityResponse(
        String username,
        boolean available,
        boolean valid,
        String message
) {
}
