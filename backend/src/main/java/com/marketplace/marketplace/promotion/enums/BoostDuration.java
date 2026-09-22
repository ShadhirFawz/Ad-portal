package com.marketplace.marketplace.promotion.enums;

import lombok.Getter;

@Getter
public enum BoostDuration {
    THREE_DAYS(3),
    SEVEN_DAYS(7),
    FOURTEEN_DAYS(14),
    THIRTY_DAYS(30);

    private final int days;

    BoostDuration(int days) {
        this.days = days;
    }
}
