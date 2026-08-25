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
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final JwtProperties jwtProperties;
    private final ObjectMapper objectMapper;

    // Kept for potential future self-signed token verification
    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(
                jwtProperties.secret()
                        .getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public UUID extractUserId(String token) {
        Map<String, Object> claims = decodePayload(token);
        Object sub = claims.get("sub");
        if (sub == null)
            throw new IllegalArgumentException("JWT missing 'sub' claim");
        return UUID.fromString(sub.toString());
    }

    @Override
    public String extractEmail(String token) {
        return (String) decodePayload(token).get("email");
    }

    @Override
    public String extractRole(String token) {
        return (String) decodePayload(token).get("role");
    }

    @Override
    public boolean isValid(String token) {
        try {
            Map<String, Object> claims = decodePayload(token);

            Object sub = claims.get("sub");
            if (sub == null)
                return false;
            UUID.fromString(sub.toString());

            Object expObj = claims.get("exp");
            if (expObj != null) {
                long expSeconds;
                if (expObj instanceof Number) {
                    expSeconds = ((Number) expObj).longValue();
                } else {
                    expSeconds = Long.parseLong(expObj.toString());
                }
                long nowSeconds = System.currentTimeMillis() / 1000L;
                if (nowSeconds > expSeconds) {
                    log.debug("Supabase token expired: exp={} now={}", expSeconds, nowSeconds);
                    return false;
                }
            }

            return true;
        } catch (Exception ex) {
            log.debug("Token validation failed: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ignored) {
        }

        try {
            Map<String, Object> claimsMap = decodePayload(token);
            return Jwts.claims().add(claimsMap).build();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to parse JWT claims", ex);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> decodePayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException(
                        "Invalid JWT structure: expected at least 2 parts, got " + parts.length);
            }

            String base64 = parts[1];
            int pad = base64.length() % 4;
            if (pad == 2)
                base64 += "==";
            else if (pad == 3)
                base64 += "=";

            byte[] decoded = Base64.getUrlDecoder().decode(base64);
            return objectMapper.readValue(decoded, Map.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to decode JWT payload: " + ex.getMessage(), ex);
        }
    }
}