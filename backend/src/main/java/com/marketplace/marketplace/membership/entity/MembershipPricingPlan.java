package com.marketplace.marketplace.membership.entity;

import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.membership.enums.BillingCycle;
import com.marketplace.marketplace.membership.enums.PlanTier;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "membership_pricing_plans",
    indexes = {
        @Index(name = "idx_membership_plans_category", columnList = "root_category_id, is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_membership_plan_category_tier_cycle", columnNames = {"root_category_id", "plan_tier", "billing_cycle"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPricingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "root_category_id", nullable = false)
    private Category rootCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_tier", nullable = false, length = 30)
    private PlanTier planTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 30)
    private BillingCycle billingCycle;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "listing_limit", nullable = false)
    private Integer listingLimit;

    @Column(name = "bonus_spotlight_count", nullable = false)
    @Builder.Default
    private Integer bonusSpotlightCount = 0;

    @Column(name = "bonus_push_up_count", nullable = false)
    @Builder.Default
    private Integer bonusPushUpCount = 0;

    @Column(name = "bonus_urgent_count", nullable = false)
    @Builder.Default
    private Integer bonusUrgentCount = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

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
