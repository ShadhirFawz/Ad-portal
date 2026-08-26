package com.marketplace.marketplace.category.dto.response;

import java.util.UUID;

public record CategoryBreadcrumbResponse(

        UUID id,

        String name,

        String slug,

        Integer level

) {
}
