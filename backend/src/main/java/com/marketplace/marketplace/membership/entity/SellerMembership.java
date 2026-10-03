package com.marketplace.marketplace.membership.entity;

import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.membership.enums.BillingCycle;
import com.marketplace.marketplace.membership.enums.MembershipStatus;
import com.marketplace.marketplace.membership.enums.PlanTier;
import com.marketplace.marketplace.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "seller_memberships",
    indexes = {
        @Index(name = "idx_seller_memberships_user_status", columnList = "user_id, status"),
        @Index(name = "idx_seller_memberships_category", columnList = "root_category_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "root_category_id", nullable = false)
    private Category rootCategory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pricing_plan_id", nullable = false)
    private MembershipPricingPlan pricingPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_tier", nullable = false, length = 30)
    private PlanTier planTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 30)
    private BillingCycle billingCycle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING_PAYMENT;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @Column(name = "listing_limit", nullable = false)
    private Integer listingLimit;

    @Column(name = "listings_used", nullable = false)
    @Builder.Default
    private Integer listingsUsed = 0;

    @Column(name = "spotlight_credits_total", nullable = false)
    @Builder.Default
    private Integer spotlightCreditsTotal = 0;

    @Column(name = "spotlight_credits_used", nullable = false)
    @Builder.Default
    private Integer spotlightCreditsUsed = 0;

    @Column(name = "push_up_credits_total", nullable = false)
    @Builder.Default
    private Integer pushUpCreditsTotal = 0;

    @Column(name = "push_up_credits_used", nullable = false)
    @Builder.Default
    private Integer pushUpCreditsUsed = 0;

    @Column(name = "urgent_credits_total", nullable = false)
    @Builder.Default
    private Integer urgentCreditsTotal = 0;

    @Column(name = "urgent_credits_used", nullable = false)
    @Builder.Default
    private Integer urgentCreditsUsed = 0;

    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;

    @Column(name = "business_email", nullable = false, length = 255)
    private String businessEmail;

    @Column(name = "business_phone", nullable = false, length = 30)
    private String businessPhone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

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

    public boolean isActive() {
        return this.status == MembershipStatus.ACTIVE
                && (this.endDate == null || this.endDate.isAfter(OffsetDateTime.now()));
    }
}
