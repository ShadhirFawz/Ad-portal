package com.marketplace.marketplace.promotion.entity;

import com.marketplace.marketplace.promotion.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "boost_payments", indexes = {
        @Index(name = "idx_boost_payments_subscription_id", columnList = "boost_subscription_id"),
        @Index(name = "idx_boost_payments_order_id", columnList = "payhere_order_id", unique = true),
        @Index(name = "idx_boost_payments_status", columnList = "payment_status")
})
@Getter
@Setter
@NoArgsConstructor
public class BoostPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "boost_subscription_id", nullable = false)
    private AdBoost boostSubscription;

    @Column(name = "payhere_order_id", nullable = false, unique = true, length = 100)
    private String payhereOrderId;

    @Column(name = "payhere_payment_id", length = 100)
    private String payherePaymentId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "LKR";

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payhere_raw_response", columnDefinition = "jsonb")
    private Map<String, Object> payhereRawResponse;

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
