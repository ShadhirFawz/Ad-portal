package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.entity.ListingBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface ListingBookmarkRepository extends JpaRepository<ListingBookmark, UUID> {

    boolean existsByUserIdAndListingId(UUID userId, UUID listingId);

    Optional<ListingBookmark> findByUserIdAndListingId(UUID userId, UUID listingId);

    void deleteByUserIdAndListingId(UUID userId, UUID listingId);

    @Query("SELECT b.listing.id FROM ListingBookmark b WHERE b.user.id = :userId AND b.listing.id IN :listingIds")
    Set<UUID> findBookmarkedListingIds(
            @Param("userId") UUID userId,
            @Param("listingIds") Collection<UUID> listingIds
    );

    Page<ListingBookmark> findAllByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
