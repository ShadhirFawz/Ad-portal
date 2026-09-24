package com.marketplace.marketplace.promotion.repository;

import com.marketplace.marketplace.promotion.entity.BoostPricingPlan;
import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoostPricingPlanRepository extends JpaRepository<BoostPricingPlan, UUID> {

    List<BoostPricingPlan> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<BoostPricingPlan> findByBoostTypeAndIsActiveTrueOrderByDisplayOrderAsc(BoostType boostType);

    Optional<BoostPricingPlan> findByBoostTypeAndDurationAndIsActiveTrue(BoostType boostType, BoostDuration duration);

    Optional<BoostPricingPlan> findByBoostTypeAndDuration(BoostType boostType, BoostDuration duration);
}
