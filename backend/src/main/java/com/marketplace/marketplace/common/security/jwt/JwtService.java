package com.marketplace.marketplace.common.security.jwt;

import java.util.UUID;

public interface JwtService {

    String generateAccessToken(UUID userId, String role);

    UUID extractUserId(String token);

    String extractRole(String token);

    boolean isValid(String token);

}