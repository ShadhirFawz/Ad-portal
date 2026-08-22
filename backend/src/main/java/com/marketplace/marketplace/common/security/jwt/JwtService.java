package com.marketplace.marketplace.common.security.jwt;

import io.jsonwebtoken.Claims;

import java.util.UUID;

public interface JwtService {

    String generateAccessToken(UUID userId, String role);

    UUID extractUserId(String token);

    String extractEmail(String token);

    String extractRole(String token);

    boolean isValid(String token);

    Claims extractClaims(String token);

}