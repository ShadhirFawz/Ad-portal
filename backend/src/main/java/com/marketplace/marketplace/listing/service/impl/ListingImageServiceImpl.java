package com.marketplace.marketplace.listing.service.impl;

import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.listing.config.ListingImageProperties;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.entity.ListingImage;
import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.dto.request.RegisterListingImageRequest;
import com.marketplace.marketplace.listing.repository.ListingImageRepository;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.listing.service.ListingImageService;
import com.marketplace.marketplace.listing.util.ListingImageMimeTypes;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ListingImageServiceImpl
        implements ListingImageService {

    private final ListingRepository listingRepository;

    private final ListingImageRepository imageRepository;

    private final ListingImageProperties properties;

    @Override
    public ListingImageResponse registerImage(
            UUID listingId,
            RegisterListingImageRequest request) {

        Listing listing = getOwnedListing(listingId);

        validateListingCanReceiveImages(listing);

        validateRequest(request, listingId);

        long existingCount = imageRepository.countByListingId(
                listingId);

        if (existingCount >= properties.getMaxImages()) {

            throw new ConflictException(
                    "Maximum number of images reached.");
        }

        boolean firstImage = existingCount == 0;

        ListingImage image = new ListingImage();

        image.setListing(listing);

        image.setStoragePath(
                request.storagePath());

        image.setFileName(
                request.fileName());

        image.setMimeType(
                request.mimeType());

        image.setFileSize(
                request.fileSize());

        image.setWidth(
                request.width());

        image.setHeight(
                request.height());

        image.setDisplayOrder(
                (int) existingCount);

        image.setPrimary(
                firstImage);

        image.setMetadata(
                request.metadata() != null
                        ? request.metadata()
                        : new HashMap<>());

        return toResponse(
                imageRepository.save(image));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListingImageResponse> getImages(
            UUID listingId) {

        return imageRepository
                .findAllByListingIdOrderByDisplayOrderAsc(
                        listingId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteImage(
            UUID listingId,
            UUID imageId) {

        Listing listing = getOwnedListing(listingId);

        ListingImage image = imageRepository
                .findByIdAndListingId(
                        imageId,
                        listingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Listing image not found."));

        imageRepository.delete(image);

        if (image.isPrimary()) {

            imageRepository
                    .findAllByListingIdOrderByDisplayOrderAsc(
                            listingId)
                    .stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setPrimary(true);
                        imageRepository.save(next);
                    });
        }
    }

    @Override
    public void setPrimary(
            UUID listingId,
            UUID imageId) {

        getOwnedListing(listingId);

        ListingImage image = imageRepository
                .findByIdAndListingId(
                        imageId,
                        listingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Listing image not found."));

        imageRepository
                .findByListingIdAndPrimaryTrue(
                        listingId)
                .ifPresent(current -> {

                    if (!current.getId()
                            .equals(imageId)) {

                        current.setPrimary(false);
                        imageRepository.save(current);
                    }
                });

        image.setPrimary(true);

        imageRepository.save(image);
    }

    private Listing getOwnedListing(
            UUID listingId) {

        UUID currentUserId = SecurityUtils.getCurrentUserId();

        return listingRepository
                .findByIdAndSellerId(
                        listingId,
                        currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Listing not found."));
    }

    private void validateListingCanReceiveImages(
            Listing listing) {

        switch (listing.getStatus()) {

            case DRAFT, ACTIVE, RESERVED -> {
                // allowed
            }

            default ->
                throw new ConflictException(
                        "Images cannot be modified for this listing.");
        }
    }

    private void validateRequest(
            RegisterListingImageRequest request,
            UUID listingId) {

        if (!ListingImageMimeTypes.isAllowed(
                request.mimeType())) {

            throw new ConflictException(
                    "Unsupported image type.");
        }

        if (request.fileSize() > properties.getMaxFileSize()) {

            throw new ConflictException(
                    "Image exceeds the maximum allowed size.");
        }

        String expectedPrefix = "listings/"
                + listingId
                + "/";

        if (!request.storagePath()
                .startsWith(expectedPrefix)) {

            throw new ConflictException(
                    "Invalid image storage path.");
        }

        if (request.storagePath().contains("..")) {

            throw new ConflictException(
                    "Invalid image storage path.");
        }
    }

    private ListingImageResponse toResponse(
            ListingImage image) {

        return new ListingImageResponse(
                image.getId(),
                image.getListing().getId(),
                image.getStoragePath(),
                buildPublicUrl(
                        image.getStoragePath()),
                image.getFileName(),
                image.getMimeType(),
                image.getFileSize(),
                image.getWidth(),
                image.getHeight(),
                image.getDisplayOrder(),
                image.isPrimary(),
                image.getMetadata(),
                image.getCreatedAt());
    }

    private String buildPublicUrl(
            String storagePath) {

        // We will wire the Supabase URL
        // from configuration in the next step.

        return storagePath;
    }
}