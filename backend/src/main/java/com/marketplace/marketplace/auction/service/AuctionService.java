package com.marketplace.marketplace.auction.service;

import com.marketplace.marketplace.auction.dto.request.PlaceBidRequest;
import com.marketplace.marketplace.auction.dto.response.AuctionPublicResponse;
import com.marketplace.marketplace.auction.dto.response.AuctionSellerResponse;
import com.marketplace.marketplace.auction.dto.response.PlaceBidResponse;

import java.util.UUID;

public interface AuctionService {

    AuctionPublicResponse startAuction(UUID listingId);

    AuctionPublicResponse getAuctionForListing(UUID listingId);

    AuctionSellerResponse getAuctionSellerView(UUID listingId);

    PlaceBidResponse placeBid(UUID listingId, PlaceBidRequest request);
}
