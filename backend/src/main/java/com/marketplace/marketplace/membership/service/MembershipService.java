package com.marketplace.marketplace.membership.service;

import com.marketplace.marketplace.membership.dto.InitiateMembershipRequest;
import com.marketplace.marketplace.membership.dto.InitiateMembershipResponse;
import com.marketplace.marketplace.membership.dto.MembershipPricingPlanResponse;
import com.marketplace.marketplace.membership.dto.SellerMembershipResponse;
import com.marketplace.marketplace.membership.entity.SellerMembership;
import com.marketplace.marketplace.user.entity.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface MembershipService {

    List<MembershipPricingPlanResponse> getPlansForCategory(UUID rootCategoryId);

    List<MembershipPricingPlanResponse> getAllActivePlans();

    Optional<SellerMembershipResponse> getMyActiveMembership(UUID userId);

    Optional<SellerMembership> getActiveMembershipEntity(UUID userId);

    InitiateMembershipResponse initiateMembership(User user, InitiateMembershipRequest request);

    SellerMembershipResponse confirmMembershipPayment(UUID membershipId, String paymentRef);

    SellerMembershipResponse confirmPaymentByOrderId(String orderId, String paymentId);

    void handlePayHereNotification(Map<String, String> payload);

    boolean useSpotlightCredit(UUID userId);

    boolean usePushUpCredit(UUID userId);

    boolean useUrgentCredit(UUID userId);
}
