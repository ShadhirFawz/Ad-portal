package com.marketplace.marketplace.common.security.util;

import com.marketplace.marketplace.common.security.model.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> getCurrentUserOptional() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {

            return Optional.empty();
        }

        return Optional.of(user);
    }

    public static AuthenticatedUser getCurrentUser() {

        return getCurrentUserOptional()
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user is not available."));
    }

    public static UUID getCurrentUserId() {
        return getCurrentUser().id();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().email();
    }
}