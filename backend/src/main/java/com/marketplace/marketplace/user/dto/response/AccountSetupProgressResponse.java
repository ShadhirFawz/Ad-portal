package com.marketplace.marketplace.user.dto.response;

import java.util.List;

public record AccountSetupProgressResponse(
        int completedCount,
        int totalCount,
        double percentage,
        boolean isFullyCompleted,
        List<AccountSetupStepItem> steps
) {
}
