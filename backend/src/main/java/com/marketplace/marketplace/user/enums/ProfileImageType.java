package com.marketplace.marketplace.user.enums;

public enum ProfileImageType {
    AVATAR,
    COVER;

    public static ProfileImageType fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Image type cannot be null");
        }
        for (ProfileImageType type : values()) {
            if (type.name().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid profile image type: " + value + ". Allowed values are 'avatar' or 'cover'.");
    }
}
