package com.marketplace.marketplace.common.security.util;

import com.marketplace.marketplace.common.security.model.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUser getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {

            throw new IllegalStateException(
                    "Authenticated user is not available.");
        }

        return user;
    }

    public static UUID getCurrentUserId() {
        return getCurrentUser().id();
    }
}