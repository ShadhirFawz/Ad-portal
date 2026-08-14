package com.marketplace.marketplace.category.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_categories_parent_id", columnList = "parent_id"),
        @Index(name = "idx_categories_active", columnList = "active"),
        @Index(name = "idx_categories_display_order", columnList = "display_order"),
        @Index(name = "idx_categories_parent_id", columnList = "parent_id"),
        @Index(name = "idx_categories_active", columnList = "active"),
        @Index(name = "idx_categories_display_order", columnList = "display_order"),
        @Index(name = "idx_categories_parent_active", columnList = "parent_id, active"),
        @Index(name = "idx_categories_allow_listings", columnList = "allow_listings")
})
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(nullable = false, length = 120, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "allow_listings", nullable = false)
    private boolean allowListings = true;

    @Column(nullable = false)
    private Integer level = 0;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        OffsetDateTime now = OffsetDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = OffsetDateTime.now();
    }
}