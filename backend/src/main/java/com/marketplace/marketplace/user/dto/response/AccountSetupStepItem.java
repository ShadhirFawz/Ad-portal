package com.marketplace.marketplace.user.dto.response;

public record AccountSetupStepItem(
        String key,
        String title,
        String description,
        boolean completed,
        String actionUrl,
        String actionLabel
) {
}
