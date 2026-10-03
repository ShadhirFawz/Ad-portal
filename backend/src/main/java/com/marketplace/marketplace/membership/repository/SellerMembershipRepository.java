package com.marketplace.marketplace.membership.repository;

import com.marketplace.marketplace.membership.entity.SellerMembership;
import com.marketplace.marketplace.membership.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SellerMembershipRepository extends JpaRepository<SellerMembership, UUID> {

    @Query("SELECT m FROM SellerMembership m WHERE m.user.id = :userId AND m.status = 'ACTIVE' AND (m.endDate IS NULL OR m.endDate > :now) ORDER BY m.createdAt DESC")
    List<SellerMembership> findActiveMembershipsByUserId(@Param("userId") UUID userId, @Param("now") OffsetDateTime now);

    default Optional<SellerMembership> findActiveMembershipByUserId(UUID userId) {
        List<SellerMembership> list = findActiveMembershipsByUserId(userId, OffsetDateTime.now());
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    Optional<SellerMembership> findByPaymentReference(String paymentReference);

    List<SellerMembership> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
