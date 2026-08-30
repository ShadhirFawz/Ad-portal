package com.marketplace.marketplace.user.dto.response;

import java.util.UUID;

public record UserPhoneNumberResponse(

        UUID id,

        String phoneNumber,

        Boolean isPrimary

) {
}
