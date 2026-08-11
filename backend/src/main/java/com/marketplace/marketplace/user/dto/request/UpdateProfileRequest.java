package com.marketplace.marketplace.user.dto.request;

import com.marketplace.marketplace.common.validation.annotation.PersonName;
import com.marketplace.marketplace.common.validation.annotation.UserName;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "First name is required") @PersonName String firstName,

        @PersonName String lastName,

        @UserName String username,

        @Size(max = 500, message = "Bio must not exceed 500 characters") String bio,

        @Size(max = 100, message = "Location must not exceed 100 characters") String location,

        Boolean publicProfile

) {
}