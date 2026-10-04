package com.marketplace.marketplace.membership.repository;

import com.marketplace.marketplace.membership.entity.MembershipPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipPaymentRepository extends JpaRepository<MembershipPayment, UUID> {

    Optional<MembershipPayment> findByPayhereOrderId(String payhereOrderId);

    Optional<MembershipPayment> findBySellerMembershipId(UUID sellerMembershipId);
}
