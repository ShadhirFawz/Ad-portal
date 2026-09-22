package com.marketplace.marketplace.promotion.repository;

import com.marketplace.marketplace.promotion.entity.AdBoost;
import com.marketplace.marketplace.promotion.enums.BoostStatus;
import com.marketplace.marketplace.promotion.enums.BoostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AdBoostRepository extends JpaRepository<AdBoost, UUID> {

    List<AdBoost> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AdBoost> findByListingIdOrderByCreatedAtDesc(UUID listingId);

    List<AdBoost> findByListingIdAndBoostStatus(UUID listingId, BoostStatus status);

    @Query("SELECT b FROM AdBoost b WHERE b.listing.id = :listingId AND b.boostStatus = 'ACTIVE' AND b.expiresAt > :now")
    List<AdBoost> findActiveByListingId(@Param("listingId") UUID listingId, @Param("now") OffsetDateTime now);

    @Query("SELECT b FROM AdBoost b WHERE b.boostStatus = 'SCHEDULED' AND b.startsAt <= :now")
    List<AdBoost> findScheduledDueForActivation(@Param("now") OffsetDateTime now);

    @Query("SELECT b FROM AdBoost b WHERE b.boostStatus = 'ACTIVE' AND b.expiresAt <= :now")
    List<AdBoost> findActiveDueForExpiry(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(b) > 0 FROM AdBoost b WHERE b.listing.id = :listingId AND b.boostType = :boostType AND b.boostStatus IN ('ACTIVE', 'SCHEDULED') AND b.expiresAt > :now")
    boolean existsActiveOrScheduledBoost(@Param("listingId") UUID listingId, @Param("boostType") BoostType boostType, @Param("now") OffsetDateTime now);
}
