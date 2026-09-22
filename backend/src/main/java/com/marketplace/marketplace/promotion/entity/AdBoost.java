package com.marketplace.marketplace.promotion.entity;

import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.promotion.enums.BoostStatus;
import com.marketplace.marketplace.promotion.enums.BoostType;
import com.marketplace.marketplace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "boost_subscriptions", indexes = {
        @Index(name = "idx_boost_subscriptions_listing_id", columnList = "listing_id"),
        @Index(name = "idx_boost_subscriptions_user_id", columnList = "user_id"),
        @Index(name = "idx_boost_subscriptions_status", columnList = "boost_status"),
        @Index(name = "idx_boost_subscriptions_starts_at", columnList = "starts_at"),
        @Index(name = "idx_boost_subscriptions_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
public class AdBoost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "boost_type", nullable = false, length = 30)
    private BoostType boostType;

    @Enumerated(EnumType.STRING)
    @Column(name = "boost_status", nullable = false, length = 30)
    private BoostStatus boostStatus = BoostStatus.PENDING_PAYMENT;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
