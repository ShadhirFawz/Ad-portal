package com.marketplace.marketplace.promotion.entity;

import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "boost_pricing_plans", uniqueConstraints = {
        @UniqueConstraint(name = "uk_boost_pricing_type_duration", columnNames = {"boost_type", "duration"})
}, indexes = {
        @Index(name = "idx_boost_pricing_active", columnList = "is_active, display_order"),
        @Index(name = "idx_boost_pricing_type", columnList = "boost_type")
})
@Getter
@Setter
@NoArgsConstructor
public class BoostPricingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "boost_type", nullable = false, length = 30)
    private BoostType boostType;

    @Enumerated(EnumType.STRING)
    @Column(name = "duration", nullable = false, length = 30)
    private BoostDuration duration;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

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

    /**
     * Calculates the discount amount in currency:
     * basePrice * (discountPercentage / 100)
     */
    public BigDecimal getDiscountAmount() {
        if (discountPercentage == null || discountPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return basePrice.multiply(discountPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the price after discount:
     * basePrice - discountAmount
     */
    public BigDecimal getPriceAfterDiscount() {
        BigDecimal discount = getDiscountAmount();
        BigDecimal discounted = basePrice.subtract(discount);
        return discounted.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : discounted.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the tax amount applied on the discounted price:
     * priceAfterDiscount * (taxPercentage / 100)
     */
    public BigDecimal getTaxAmount() {
        if (taxPercentage == null || taxPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return getPriceAfterDiscount().multiply(taxPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the final payable amount including discount and tax:
     * priceAfterDiscount + taxAmount
     */
    public BigDecimal getFinalPrice() {
        return getPriceAfterDiscount().add(getTaxAmount()).setScale(2, RoundingMode.HALF_UP);
    }
}
