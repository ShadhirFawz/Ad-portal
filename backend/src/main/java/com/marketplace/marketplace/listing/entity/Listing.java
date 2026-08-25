package com.marketplace.marketplace.listing.entity;

import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.ModerationStatus;
import com.marketplace.marketplace.listing.enums.PricingType;
import com.marketplace.marketplace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "listings", indexes = {
        @Index(name = "idx_listings_seller_id", columnList = "seller_id"),
        @Index(name = "idx_listings_category_id", columnList = "category_id"),
        @Index(name = "idx_listings_status", columnList = "status"),
        @Index(name = "idx_listings_created_at", columnList = "created_at"),
        @Index(name = "idx_listings_published_at", columnList = "published_at")
})
@Getter
@Setter
@NoArgsConstructor
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency = "LKR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ListingCondition condition;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ListingStatus status = ListingStatus.DRAFT;

    @Column(name = "view_count", nullable = false)
    private long viewCount = 0;

    @Column(name = "favorite_count", nullable = false)
    private long favoriteCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false, length = 30)
    private ListingType listingType = ListingType.ITEM;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false, length = 30)
    private PricingType pricingType = PricingType.FIXED;

    @Column(nullable = false)
    private boolean negotiable = false;

    @Column(name = "minimum_offer_price", precision = 14, scale = 2)
    private BigDecimal minimumOfferPrice;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity = 1;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", nullable = false, length = 30)
    private ListingLocationType locationType = ListingLocationType.CITY;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String province;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_attributes", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> customAttributes = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", nullable = false, length = 30)
    private ModerationStatus moderationStatus = ModerationStatus.NOT_REQUIRED;

    @Column(name = "moderation_reason", length = 1000)
    private String moderationReason;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by")
    private User publishedBy;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @Column(name = "deletion_reason", length = 500)
    private String deletionReason;

    @Column(name = "last_published_at")
    private OffsetDateTime lastPublishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

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