package com.marketplace.marketplace.category.dto.response;

import java.util.Map;
import java.util.UUID;

public record CategoryResponse(

                UUID id,

                String name,

                String slug,

                String code,

                String description,

                UUID parentId,

                Integer level,

                Boolean allowListings,

                String iconUrl,

                Integer displayOrder,

                boolean active,

                Map<String, Object> metadata

) {
}