package com.marketplace.marketplace.common.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.marketplace.common.security.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private static final String TOKEN_TYPE_CLAIM = "typ";
    private static final String ACCESS_TOKEN_TYPE = "ACCESS";

    private final JwtProperties jwtProperties;
    private final ObjectMapper objectMapper;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(
                jwtProperties.secret()
                        .getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public String generateAccessToken(UUID userId, String role) {

        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtProperties.issuer())
                .claim(TOKEN_TYPE_CLAIM, ACCESS_TOKEN_TYPE)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(
                        Date.from(
                                now.plus(
                                        jwtProperties.accessTokenExpiration())))
                .signWith(signingKey())
                .compact();
    }

    @Override
    public UUID extractUserId(String token) {
        String subject = extractClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    @Override
    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }

    @Override
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    @Override
    public boolean isValid(String token) {
        try {
            Claims claims = extractClaims(token);
            if (claims == null || claims.getSubject() == null) {
                return false;
            }

            // Check UUID format
            UUID.fromString(claims.getSubject());

            // Check expiration
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                return false;
            }

            return true;
        } catch (Exception ex) {
            log.debug("Token validation failed: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public Claims extractClaims(String token) {
        // 1. Try parsing and verifying with signing key
        try {
            return Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ignored) {
            // Fallback for Supabase Auth JWT tokens
        }

        // 2. Parse JWT payload directly (Supabase token)
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid JWT structure");
            }

            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            @SuppressWarnings("unchecked")
            Map<String, Object> claimsMap = objectMapper.readValue(decoded, Map.class);

            return Jwts.claims().add(claimsMap).build();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to parse JWT claims", ex);
        }
    }
}