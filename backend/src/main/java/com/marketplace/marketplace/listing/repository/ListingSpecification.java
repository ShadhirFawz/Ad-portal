package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.dto.request.ListingFilterParams;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.entity.ListingFavorite;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class ListingSpecification {

    private ListingSpecification() {
    }

    private static void applyCommonFilterParams(ListingFilterParams params,
                                                Root<Listing> root,
                                                CriteriaBuilder criteriaBuilder,
                                                List<Predicate> predicates) {
        if (params == null) {
            return;
        }

        if (params.search() != null && !params.search().isBlank()) {
            String pattern = "%" + params.search().trim().toLowerCase() + "%";
            Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
            Predicate descriptionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
            Predicate cityMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), pattern);
            predicates.add(criteriaBuilder.or(titleMatch, descriptionMatch, cityMatch));
        }

        if (params.condition() != null) {
            predicates.add(criteriaBuilder.equal(root.get("condition"), params.condition()));
        }

        if (params.pricingType() != null) {
            predicates.add(criteriaBuilder.equal(root.get("pricingType"), params.pricingType()));
        }

        if (params.listingType() != null) {
            predicates.add(criteriaBuilder.equal(root.get("listingType"), params.listingType()));
        }

        if (params.minPrice() != null) {
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), params.minPrice()));
        }

        if (params.maxPrice() != null) {
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), params.maxPrice()));
        }
    }

    public static Specification<Listing> buildSpec(ListingFilterParams params) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("status"), ListingStatus.ACTIVE));
            applyCommonFilterParams(params, root, criteriaBuilder, predicates);
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Listing> buildSellerSpec(UUID sellerId, ListingStatus status, ListingFilterParams params) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("seller").get("id"), sellerId));

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            } else {
                predicates.add(criteriaBuilder.notEqual(root.get("status"), ListingStatus.DELETED));
            }

            applyCommonFilterParams(params, root, criteriaBuilder, predicates);
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Listing> buildFavoriteSpec(UUID userId, ListingFilterParams params) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Subquery<UUID> favSubquery = query.subquery(UUID.class);
            Root<ListingFavorite> favRoot = favSubquery.from(ListingFavorite.class);
            favSubquery.select(favRoot.get("listing").get("id"))
                    .where(criteriaBuilder.equal(favRoot.get("user").get("id"), userId));

            predicates.add(root.get("id").in(favSubquery));
            predicates.add(criteriaBuilder.notEqual(root.get("status"), ListingStatus.DELETED));

            applyCommonFilterParams(params, root, criteriaBuilder, predicates);
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
