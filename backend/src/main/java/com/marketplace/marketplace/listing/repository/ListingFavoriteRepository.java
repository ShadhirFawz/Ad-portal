package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.entity.ListingFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface ListingFavoriteRepository extends JpaRepository<ListingFavorite, UUID> {

    boolean existsByUserIdAndListingId(UUID userId, UUID listingId);

    Optional<ListingFavorite> findByUserIdAndListingId(UUID userId, UUID listingId);

    void deleteByUserIdAndListingId(UUID userId, UUID listingId);

    long countByListingId(UUID listingId);

    @Query("SELECT f.listing.id FROM ListingFavorite f WHERE f.user.id = :userId AND f.listing.id IN :listingIds")
    Set<UUID> findFavoritedListingIds(
            @Param("userId") UUID userId,
            @Param("listingIds") Collection<UUID> listingIds
    );

    @Query("SELECT f.listing.id, COUNT(f.id) FROM ListingFavorite f WHERE f.listing.id IN :listingIds GROUP BY f.listing.id")
    java.util.List<Object[]> findFavoriteCountsByListingIdIn(
            @Param("listingIds") Collection<UUID> listingIds
    );

    Page<ListingFavorite> findAllByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
