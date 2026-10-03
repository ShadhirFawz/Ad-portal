package com.marketplace.marketplace.membership.repository;

import com.marketplace.marketplace.membership.entity.MembershipPricingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MembershipPricingPlanRepository extends JpaRepository<MembershipPricingPlan, UUID> {

    List<MembershipPricingPlan> findAllByRootCategoryIdAndIsActiveTrueOrderByBasePriceAsc(UUID rootCategoryId);

    List<MembershipPricingPlan> findAllByIsActiveTrue();
}
