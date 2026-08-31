package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.dto.request.ListingFilterParams;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ListingSpecification {

    private ListingSpecification() {
    }

    public static Specification<Listing> buildSpec(ListingFilterParams params) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce ACTIVE status for public listings
            predicates.add(criteriaBuilder.equal(root.get("status"), ListingStatus.ACTIVE));

            if (params != null) {
                if (params.search() != null && !params.search().isBlank()) {
                    String pattern = "%" + params.search().trim().toLowerCase() + "%";
                    Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                    Predicate descriptionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                    predicates.add(criteriaBuilder.or(titleMatch, descriptionMatch));
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

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
