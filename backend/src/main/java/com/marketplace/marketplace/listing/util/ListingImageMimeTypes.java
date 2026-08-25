package com.marketplace.marketplace.listing.util;

import java.util.Set;

public final class ListingImageMimeTypes {

    private ListingImageMimeTypes() {
    }

    public static final Set<String> ALLOWED = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    public static boolean isAllowed(
            String mimeType) {

        return mimeType != null
                && ALLOWED.contains(
                        mimeType.toLowerCase());
    }
}