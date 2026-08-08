package com.marketplace.marketplace.common.security.model;

import com.marketplace.marketplace.common.enums.Role;

import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        Role role) {
}