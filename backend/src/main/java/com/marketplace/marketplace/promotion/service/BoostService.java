package com.marketplace.marketplace.promotion.service;

import com.marketplace.marketplace.promotion.dto.request.BoostCheckoutRequest;
import com.marketplace.marketplace.promotion.dto.request.BoostIpnRequest;
import com.marketplace.marketplace.promotion.dto.response.AdBoostResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostCheckoutResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostPlanResponse;

import java.util.List;
import java.util.UUID;

public interface BoostService {

    List<BoostPlanResponse> getBoostPlans();

    BoostCheckoutResponse createCheckout(BoostCheckoutRequest request);

    void processPayHereIpn(BoostIpnRequest ipnRequest);

    List<AdBoostResponse> getMyBoosts();

    List<AdBoostResponse> getActiveBoostsForListing(UUID listingId);

    void cancelScheduledBoost(UUID boostId);

    AdBoostResponse confirmPayment(String orderId, String paymentId);

    void activateDueScheduledBoosts();

    void expireCompletedBoosts();
}
