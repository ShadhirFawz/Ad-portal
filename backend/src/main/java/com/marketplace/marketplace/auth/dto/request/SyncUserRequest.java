package com.marketplace.marketplace.auth.dto.request;

import com.marketplace.marketplace.common.validation.annotation.PersonName;
import com.marketplace.marketplace.common.validation.annotation.PhoneNumber;

/**
 * Optional profile hints sent by the frontend on first sync after Supabase sign-up.
 * All fields are nullable; the backend uses them only when creating a new local user.
 */
public record SyncUserRequest(

        @PersonName String firstName,

        @PersonName String lastName,

        @PhoneNumber String phoneNumber,

        String username

) {
}
