package com.marketplace.marketplace.auth.service;

import com.marketplace.marketplace.auth.dto.request.VerifyEmailRequest;

public interface EmailVerificationService {

    void verify(VerifyEmailRequest request);

    void createAndSendVerificationToken(
            com.marketplace.marketplace.user.entity.User user);
}