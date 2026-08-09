package com.marketplace.marketplace.auth.service;

import com.marketplace.marketplace.auth.dto.request.ForgotPasswordRequest;
import com.marketplace.marketplace.auth.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    void requestReset(ForgotPasswordRequest request);

    void reset(ResetPasswordRequest request);
}