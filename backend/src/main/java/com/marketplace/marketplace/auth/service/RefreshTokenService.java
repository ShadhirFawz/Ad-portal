package com.marketplace.marketplace.auth.service;

import com.marketplace.marketplace.auth.entity.RefreshToken;
import com.marketplace.marketplace.user.entity.User;

public interface RefreshTokenService {

    RefreshToken create(User user);

    RefreshToken validate(String token);

    RefreshToken rotate(RefreshToken refreshToken);

    void revoke(String token);

    void revokeAll(User user);
}