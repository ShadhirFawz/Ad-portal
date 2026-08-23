package com.marketplace.marketplace.common.security.jwt;

import io.jsonwebtoken.Claims;

import java.util.UUID;

/**
 * JWT utility for reading Supabase-issued access tokens.
 * The backend only *validates and reads* tokens; Supabase is the sole issuer.
 */
public interface JwtService {

    UUID extractUserId(String token);

    String extractEmail(String token);

    String extractRole(String token);

    boolean isValid(String token);

    Claims extractClaims(String token);

}