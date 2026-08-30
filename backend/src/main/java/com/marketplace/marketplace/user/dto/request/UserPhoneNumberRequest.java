package com.marketplace.marketplace.user.dto.request;

import com.marketplace.marketplace.common.validation.annotation.PhoneNumber;
import jakarta.validation.constraints.NotBlank;

public record UserPhoneNumberRequest(

        @NotBlank(message = "Phone number is required")
        @PhoneNumber
        String phoneNumber,

        Boolean isPrimary

) {
}
