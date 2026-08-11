package com.marketplace.marketplace.user.dto.request;

import com.marketplace.marketplace.common.validation.annotation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(

        @NotBlank(message = "Current password is required") @StrongPassword String currentPassword,

        @NotBlank(message = "New password is required") @StrongPassword String newPassword

) {
}