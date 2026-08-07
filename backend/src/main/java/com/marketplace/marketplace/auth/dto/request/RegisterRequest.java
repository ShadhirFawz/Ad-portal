package com.marketplace.marketplace.auth.dto.request;

import com.marketplace.marketplace.common.validation.annotation.PersonName;
import com.marketplace.marketplace.common.validation.annotation.PhoneNumber;
import com.marketplace.marketplace.common.validation.annotation.StrongPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

                @NotBlank(message = "First name is required") @PersonName String firstName,

                @PersonName String lastName,

                @NotBlank(message = "Email is required") @Email(message = "Invalid email address") @Size(max = 255) String email,

                @PhoneNumber String phoneNumber,

                @NotBlank(message = "Password is required") @StrongPassword String password

) {
}