package com.marketplace.marketplace.user.dto.response;

public record UserOpeningHourResponse(

        Integer dayOfWeek,

        Boolean isClosed,

        String openTime,

        String closeTime
) {
}
