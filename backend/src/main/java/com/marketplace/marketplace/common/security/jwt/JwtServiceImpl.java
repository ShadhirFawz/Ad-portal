package com.marketplace.marketplace.common.security.jwt;

import com.marketplace.marketplace.common.security.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private static final String TOKEN_TYPE_CLAIM = "typ";

    private static final String ACCESS_TOKEN_TYPE = "ACCESS";

    private final JwtProperties jwtProperties;

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

        String subject = parseClaims(token).getSubject();

        return UUID.fromString(subject);
    }

    @Override
    public String extractRole(String token) {

        return parseClaims(token)
                .get("role", String.class);
    }

    @Override
    public boolean isValid(String token) {

        try {

            Claims claims = parseClaims(token);

            return ACCESS_TOKEN_TYPE.equals(
                    claims.get(TOKEN_TYPE_CLAIM, String.class));

        } catch (Exception ex) {

            return false;
        }
    }

    private Claims parseClaims(String token) {

        return Jwts.parser()
                .verifyWith(signingKey())
                .requireIssuer(jwtProperties.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}