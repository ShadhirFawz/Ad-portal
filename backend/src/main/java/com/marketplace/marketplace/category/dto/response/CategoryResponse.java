package com.marketplace.marketplace.category.dto.response;

import java.util.UUID;

public record CategoryResponse(

        UUID id,

        String name,

        String slug,

        String description,

        UUID parentId,

        String iconUrl,

        Integer displayOrder,

        boolean active

) {
}