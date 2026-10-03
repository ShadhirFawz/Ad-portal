package com.marketplace.marketplace.user.dto.request;

import com.marketplace.marketplace.common.validation.annotation.PersonName;
import com.marketplace.marketplace.common.validation.annotation.UserName;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProfileRequest(

        @PersonName String firstName,

        @PersonName String lastName,

        @UserName String username,

        @Size(max = 500, message = "Bio must not exceed 500 characters") String bio,

        @Size(max = 200, message = "Business name must not exceed 200 characters") String businessName,

        @Size(max = 255, message = "Business email must not exceed 255 characters") String businessEmail,

        @Size(max = 100, message = "Location must not exceed 100 characters") String location,

        Boolean publicProfile,

        String avatarUrl,

        String coverPhotoUrl,

        @Size(max = 3, message = "You can add a maximum of 3 phone numbers")
        List<@Valid UserPhoneNumberRequest> phoneNumbers,

        @Size(min = 7, max = 7, message = "Opening hours must include all 7 days of the week")
        List<@Valid UserOpeningHourRequest> openingHours

) {
}