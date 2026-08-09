package com.marketplace.marketplace.auth.dto.request;

import com.marketplace.marketplace.common.validation.annotation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(

        @NotBlank String token,

        @NotBlank @StrongPassword String newPassword

) {
}