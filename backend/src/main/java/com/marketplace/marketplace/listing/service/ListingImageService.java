package com.marketplace.marketplace.listing.service;

import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.dto.request.RegisterListingImageRequest;

import java.util.List;
import java.util.UUID;

public interface ListingImageService {

        ListingImageResponse registerImage(
                        UUID listingId,
                        RegisterListingImageRequest request);

        List<ListingImageResponse> getImages(
                        UUID listingId);

        ListingImageResponse getPrimaryImage(
                        UUID listingId);

        void deleteImage(
                        UUID listingId,
                        UUID imageId);

        void setPrimary(
                        UUID listingId,
                        UUID imageId);

        void reorderImages(
                        UUID listingId,
                        List<UUID> imageIds);
}