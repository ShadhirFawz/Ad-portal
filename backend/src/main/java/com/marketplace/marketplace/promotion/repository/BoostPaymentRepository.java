package com.marketplace.marketplace.promotion.repository;

import com.marketplace.marketplace.promotion.entity.BoostPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BoostPaymentRepository extends JpaRepository<BoostPayment, UUID> {

    Optional<BoostPayment> findByPayhereOrderId(String payhereOrderId);

    Optional<BoostPayment> findByBoostSubscriptionId(UUID boostSubscriptionId);
}
