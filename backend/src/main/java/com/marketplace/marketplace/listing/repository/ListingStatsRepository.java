package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.entity.ListingStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingStatsRepository extends JpaRepository<ListingStats, UUID> {

    @Modifying
    @Query(value = """
        INSERT INTO listing_stats (listing_id, view_count)
        VALUES (:listingId, 1)
        ON CONFLICT (listing_id)
        DO UPDATE SET view_count = listing_stats.view_count + 1
    """, nativeQuery = true)
    void incrementViewCount(@Param("listingId") UUID listingId);

    @Query("SELECT s.viewCount FROM ListingStats s WHERE s.listingId = :listingId")
    Optional<Long> findViewCountByListingId(@Param("listingId") UUID listingId);

    @Query("SELECT s.listingId, s.viewCount FROM ListingStats s WHERE s.listingId IN :listingIds")
    List<Object[]> findViewCountsByListingIdIn(@Param("listingIds") Collection<UUID> listingIds);
}
