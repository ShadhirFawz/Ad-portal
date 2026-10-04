package com.marketplace.marketplace.membership.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.common.enums.Role;
import com.marketplace.marketplace.common.exception.BadRequestException;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ForbiddenException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.membership.dto.InitiateMembershipRequest;
import com.marketplace.marketplace.membership.dto.InitiateMembershipResponse;
import com.marketplace.marketplace.membership.dto.MembershipPricingPlanResponse;
import com.marketplace.marketplace.membership.dto.SellerMembershipResponse;
import com.marketplace.marketplace.membership.entity.MembershipPayment;
import com.marketplace.marketplace.membership.entity.MembershipPricingPlan;
import com.marketplace.marketplace.membership.entity.SellerMembership;
import com.marketplace.marketplace.membership.enums.MembershipStatus;
import com.marketplace.marketplace.membership.repository.MembershipPaymentRepository;
import com.marketplace.marketplace.membership.repository.MembershipPricingPlanRepository;
import com.marketplace.marketplace.membership.repository.SellerMembershipRepository;
import com.marketplace.marketplace.membership.service.MembershipService;
import com.marketplace.marketplace.promotion.config.PayHereProperties;
import com.marketplace.marketplace.promotion.enums.PaymentStatus;
import com.marketplace.marketplace.promotion.util.PayHereHashUtil;
import com.marketplace.marketplace.user.dto.request.UserOpeningHourRequest;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.entity.UserOpeningHour;
import com.marketplace.marketplace.user.entity.UserPhoneNumber;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipServiceImpl implements MembershipService {

    private final MembershipPricingPlanRepository pricingPlanRepository;
    private final SellerMembershipRepository sellerMembershipRepository;
    private final MembershipPaymentRepository membershipPaymentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PayHereProperties payHereProperties;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPricingPlanResponse> getPlansForCategory(UUID rootCategoryId) {
        return pricingPlanRepository.findAllByRootCategoryIdAndIsActiveTrueOrderByBasePriceAsc(rootCategoryId)
                .stream()
                .map(MembershipPricingPlanResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPricingPlanResponse> getAllActivePlans() {
        return pricingPlanRepository.findAllByIsActiveTrue()
                .stream()
                .map(MembershipPricingPlanResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SellerMembershipResponse> getMyActiveMembership(UUID userId) {
        return sellerMembershipRepository.findActiveMembershipByUserId(userId)
                .map(m -> {
                    MembershipPayment payment = membershipPaymentRepository.findBySellerMembershipId(m.getId()).orElse(null);
                    return SellerMembershipResponse.fromEntity(m, payment);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SellerMembership> getActiveMembershipEntity(UUID userId) {
        return sellerMembershipRepository.findActiveMembershipByUserId(userId);
    }

    @Override
    @Transactional
    public InitiateMembershipResponse initiateMembership(User detachedUser, InitiateMembershipRequest request) {
        // Re-fetch inside this transaction so lazy collections load without a session error
        User user = userRepository.findById(detachedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.MEMBER) {
            throw new BadRequestException("You must complete the seller registration before upgrading to a Verified Seller membership. Please visit /become-a-seller.");
        }

        Optional<SellerMembership> activeMembershipOpt = sellerMembershipRepository.findActiveMembershipByUserId(user.getId());
        if (activeMembershipOpt.isPresent()) {
            SellerMembership active = activeMembershipOpt.get();
            throw new ConflictException("You already have an active Verified Seller membership for category '" 
                    + active.getRootCategory().getName() + "'. A seller is only allowed to subscribe to one active membership at a time.");
        }

        MembershipPricingPlan plan = pricingPlanRepository.findById(request.pricingPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Pricing plan not found"));

        Category rootCategory = plan.getRootCategory();
        if (rootCategory == null) {
            throw new BadRequestException("The selected pricing plan is not associated with any category.");
        }

        // Validate requested username if provided and changed
        String rawUsername = request.username();
        String targetUsername = null;
        if (rawUsername != null && !rawUsername.isBlank()) {
            targetUsername = rawUsername.trim().toLowerCase();
            if (!targetUsername.equals(user.getUsername()) && userRepository.existsByUsernameIgnoreCase(targetUsername)) {
                throw new ConflictException("Username @" + targetUsername + " is already taken by another account.");
            }
        }

        // Serialize opening hours to JSON if provided (to be applied ONLY on payment confirmation)
        String openingHoursJson = null;
        if (request.openingHours() != null && !request.openingHours().isEmpty()) {
            try {
                openingHoursJson = objectMapper.writeValueAsString(request.openingHours());
            } catch (Exception e) {
                log.warn("Failed to serialize opening hours to JSON for membership initiation", e);
            }
        }

        String rawPhone = request.businessPhone().trim();
        String orderId = "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();

        SellerMembership membership = SellerMembership.builder()
                .user(user)
                .rootCategory(rootCategory)
                .pricingPlan(plan)
                .planTier(plan.getPlanTier())
                .billingCycle(plan.getBillingCycle())
                .status(MembershipStatus.PENDING_PAYMENT)
                .listingLimit(plan.getListingLimit())
                .listingsUsed(0)
                .spotlightCreditsTotal(plan.getBonusSpotlightCount())
                .spotlightCreditsUsed(0)
                .pushUpCreditsTotal(plan.getBonusPushUpCount())
                .pushUpCreditsUsed(0)
                .urgentCreditsTotal(plan.getBonusUrgentCount())
                .urgentCreditsUsed(0)
                .businessName(request.businessName().trim())
                .businessEmail(request.businessEmail().trim())
                .businessPhone(rawPhone)
                .bio(request.bio() != null ? request.bio().trim() : null)
                .username(targetUsername)
                .openingHoursJson(openingHoursJson)
                .paymentReference(orderId)
                .build();

        membership = sellerMembershipRepository.save(membership);

        BigDecimal amount = plan.getBasePrice();
        String formattedAmount = PayHereHashUtil.formatAmount(amount);
        String currency = payHereProperties.getCurrency() != null ? payHereProperties.getCurrency() : "LKR";
        String merchantId = payHereProperties.getMerchantId();
        String merchantSecret = payHereProperties.getMerchantSecret();

        // Create initial MembershipPayment record in PENDING state
        MembershipPayment payment = MembershipPayment.builder()
                .sellerMembership(membership)
                .payhereOrderId(orderId)
                .amount(amount)
                .currency(currency)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        membershipPaymentRepository.save(payment);

        String hash = PayHereHashUtil.generateCheckoutHash(merchantId, orderId, amount, currency, merchantSecret);

        String returnUrl = payHereProperties.getMembershipReturnUrl() + "?order_id=" + orderId;
        String cancelUrl = payHereProperties.getMembershipCancelUrl() + "?order_id=" + orderId;
        String notifyUrl = payHereProperties.getMembershipNotifyUrl();

        Map<String, String> payHereParams = new LinkedHashMap<>();
        payHereParams.put("merchant_id", merchantId);
        payHereParams.put("return_url", returnUrl);
        payHereParams.put("cancel_url", cancelUrl);
        payHereParams.put("notify_url", notifyUrl);
        payHereParams.put("order_id", orderId);
        payHereParams.put("items", "Wudo Verified Seller - " + rootCategory.getName() + " (" + plan.getPlanTier() + ")");
        payHereParams.put("currency", currency);
        payHereParams.put("amount", formattedAmount);
        payHereParams.put("first_name", user.getFirstName() != null ? user.getFirstName() : "Seller");
        payHereParams.put("last_name", user.getLastName() != null ? user.getLastName() : "User");
        payHereParams.put("email", user.getEmail());
        payHereParams.put("phone", rawPhone);
        payHereParams.put("address", user.getLocation() != null ? user.getLocation() : "Colombo");
        payHereParams.put("city", "Colombo");
        payHereParams.put("country", "Sri Lanka");
        payHereParams.put("hash", hash);
        payHereParams.put("custom_1", membership.getId().toString());
        payHereParams.put("custom_2", rootCategory.getId().toString());

        String checkoutUrl = payHereProperties.getBaseUrl() + "/pay/checkout";

        log.info("PayHere membership hash generated for orderId: {}, amount: {}, currency: {}, hash: {}", orderId, formattedAmount, currency, hash);

        return new InitiateMembershipResponse(
                membership.getId(),
                orderId,
                amount,
                currency,
                merchantId,
                hash,
                plan.getPlanTier().name(),
                plan.getBillingCycle().name(),
                rootCategory.getName(),
                checkoutUrl,
                payHereParams
        );
    }

    @Override
    @Transactional
    public SellerMembershipResponse confirmMembershipPayment(UUID membershipId, String paymentRef) {
        SellerMembership membership = sellerMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership record not found"));

        MembershipPayment payment = membershipPaymentRepository.findBySellerMembershipId(membership.getId())
                .orElse(null);

        if (payment != null) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPayherePaymentId(paymentRef);
            membershipPaymentRepository.save(payment);
        }

        activateMembership(membership, paymentRef);
        return SellerMembershipResponse.fromEntity(membership, payment);
    }

    @Override
    @Transactional
    public SellerMembershipResponse confirmPaymentByOrderId(String orderId, String paymentId) {
        log.info("Explicit payment confirmation requested for membership orderId: {}, paymentId: {}", orderId, paymentId);
        MembershipPayment payment = membershipPaymentRepository.findByPayhereOrderId(orderId).orElse(null);
        SellerMembership membership;

        if (payment != null) {
            membership = payment.getSellerMembership();
        } else {
            membership = sellerMembershipRepository.findByPaymentReference(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Membership not found for orderId: " + orderId));
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!membership.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("You do not have permission to confirm this membership payment.");
        }

        if (payment != null && payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            if (paymentId != null && !paymentId.isBlank()) {
                payment.setPayherePaymentId(paymentId.trim());
            }
            if (payment.getPayhereRawResponse() == null) {
                Map<String, Object> raw = new HashMap<>();
                raw.put("order_id", orderId);
                if (paymentId != null && !paymentId.isBlank()) {
                    raw.put("payment_id", paymentId.trim());
                }
                raw.put("status_code", "2");
                raw.put("status_message", "Successfully verified and confirmed from PayHere checkout return");
                raw.put("channel", "RETURN_URL_CONFIRMATION");
                payment.setPayhereRawResponse(raw);
            }
            membershipPaymentRepository.save(payment);
        }

        if (membership.getStatus() != MembershipStatus.ACTIVE) {
            activateMembership(membership, paymentId != null && !paymentId.isBlank() ? paymentId : orderId);
            log.info("Membership {} confirmed and activated via return URL for user {}", membership.getId(), currentUserId);
        }

        return SellerMembershipResponse.fromEntity(membership, payment);
    }

    @Override
    @Transactional
    public void handlePayHereNotification(Map<String, String> payload) {
        String orderId = payload.get("order_id");
        String statusCode = payload.get("status_code");
        String md5sig = payload.get("md5sig");
        String payhereAmount = payload.get("payhere_amount");
        String payhereCurrency = payload.get("payhere_currency");
        String paymentId = payload.get("payment_id");

        if (orderId == null) {
            log.warn("PayHere notification received without order_id");
            return;
        }

        MembershipPayment payment = membershipPaymentRepository.findByPayhereOrderId(orderId).orElse(null);
        SellerMembership membership = payment != null
                ? payment.getSellerMembership()
                : sellerMembershipRepository.findByPaymentReference(orderId).orElse(null);

        if (membership == null) {
            log.warn("No membership found with paymentReference: {}", orderId);
            return;
        }

        boolean isValid = PayHereHashUtil.verifyIpnHash(
                payHereProperties.getMerchantId(),
                orderId,
                payhereAmount,
                payhereCurrency,
                statusCode,
                md5sig,
                payHereProperties.getMerchantSecret()
        );

        if (!isValid) {
            log.warn("Invalid PayHere IPN hash for membership order: {}", orderId);
            return;
        }

        Map<String, Object> raw = new HashMap<>(payload);
        if (payment != null) {
            payment.setPayhereRawResponse(raw);
            payment.setPayherePaymentId(paymentId);
        }

        if ("2".equals(statusCode)) { // 2 = SUCCESS
            if (payment != null) {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
            }
            activateMembership(membership, paymentId != null ? paymentId : orderId);
            log.info("Successfully activated verified seller membership {} for user {}", membership.getId(), membership.getUser().getId());
        } else if ("0".equals(statusCode)) {
            if (payment != null) {
                payment.setPaymentStatus(PaymentStatus.PENDING);
            }
        } else if ("-1".equals(statusCode)) {
            if (payment != null) {
                payment.setPaymentStatus(PaymentStatus.CANCELLED);
            }
            membership.setStatus(MembershipStatus.CANCELLED);
            sellerMembershipRepository.save(membership);
        } else {
            if (payment != null) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
            }
            membership.setStatus(MembershipStatus.CANCELLED);
            sellerMembershipRepository.save(membership);
            log.info("PayHere notification status code {} for order {}", statusCode, orderId);
        }

        if (payment != null) {
            membershipPaymentRepository.save(payment);
        }
    }

    private void activateMembership(SellerMembership membership, String paymentRef) {
        OffsetDateTime now = OffsetDateTime.now();
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setStartDate(now);
        membership.setEndDate(now.plusDays(membership.getPricingPlan().getDurationDays()));
        if (paymentRef != null) {
            membership.setPaymentReference(paymentRef);
        }

        User user = membership.getUser();
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.VERIFIED_SELLER);
        }
        user.setBusinessName(membership.getBusinessName());
        user.setBusinessEmail(membership.getBusinessEmail());
        if (membership.getBio() != null) {
            user.setBio(membership.getBio());
        }

        // Apply new username if provided and still available
        if (membership.getUsername() != null && !membership.getUsername().isBlank()) {
            String uname = membership.getUsername().trim().toLowerCase();
            if (!uname.equals(user.getUsername())) {
                if (!userRepository.existsByUsernameIgnoreCase(uname)) {
                    user.setUsername(uname);
                } else {
                    log.warn("Requested username {} was taken before membership activation for user {}", uname, user.getId());
                }
            }
        }

        // Apply business phone
        if (membership.getBusinessPhone() != null && !membership.getBusinessPhone().isBlank()) {
            updateUserBusinessPhone(user, membership.getBusinessPhone());
        }

        // Apply opening hours
        if (membership.getOpeningHoursJson() != null && !membership.getOpeningHoursJson().isBlank()) {
            try {
                List<UserOpeningHourRequest> hours = objectMapper.readValue(
                        membership.getOpeningHoursJson(),
                        new TypeReference<List<UserOpeningHourRequest>>() {}
                );
                applyOpeningHours(user, hours);
            } catch (Exception e) {
                log.warn("Failed to deserialize and apply opening hours for membership {}", membership.getId(), e);
                user.ensureDefaultOpeningHours();
            }
        } else {
            user.ensureDefaultOpeningHours();
        }

        userRepository.save(user);
        sellerMembershipRepository.save(membership);
    }

    private void updateUserBusinessPhone(User user, String rawPhone) {
        String cleanPhone = rawPhone.trim();
        List<UserPhoneNumber> phoneNumbers = user.getPhoneNumbers();
        if (phoneNumbers == null) {
            phoneNumbers = new ArrayList<>();
            user.setPhoneNumbers(phoneNumbers);
        }

        for (UserPhoneNumber p : phoneNumbers) {
            p.setIsBusiness(false);
        }

        Optional<UserPhoneNumber> existingPhoneOpt = phoneNumbers.stream()
                .filter(p -> p.getPhoneNumber().replaceAll("[^0-9]", "").equals(cleanPhone.replaceAll("[^0-9]", "")))
                .findFirst();

        if (existingPhoneOpt.isPresent()) {
            existingPhoneOpt.get().setIsBusiness(true);
        } else {
            if (phoneNumbers.size() < 3) {
                UserPhoneNumber newPhone = UserPhoneNumber.builder()
                        .user(user)
                        .phoneNumber(cleanPhone)
                        .isPrimary(phoneNumbers.isEmpty())
                        .isWhatsapp(false)
                        .isBusiness(true)
                        .build();
                phoneNumbers.add(newPhone);
            }
        }
    }

    @Override
    @Transactional
    public boolean useSpotlightCredit(UUID userId) {
        Optional<SellerMembership> opt = sellerMembershipRepository.findActiveMembershipByUserId(userId);
        if (opt.isPresent()) {
            SellerMembership m = opt.get();
            if (m.getSpotlightCreditsUsed() < m.getSpotlightCreditsTotal()) {
                m.setSpotlightCreditsUsed(m.getSpotlightCreditsUsed() + 1);
                sellerMembershipRepository.save(m);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean usePushUpCredit(UUID userId) {
        Optional<SellerMembership> opt = sellerMembershipRepository.findActiveMembershipByUserId(userId);
        if (opt.isPresent()) {
            SellerMembership m = opt.get();
            if (m.getPushUpCreditsUsed() < m.getPushUpCreditsTotal()) {
                m.setPushUpCreditsUsed(m.getPushUpCreditsUsed() + 1);
                sellerMembershipRepository.save(m);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean useUrgentCredit(UUID userId) {
        Optional<SellerMembership> opt = sellerMembershipRepository.findActiveMembershipByUserId(userId);
        if (opt.isPresent()) {
            SellerMembership m = opt.get();
            if (m.getUrgentCreditsUsed() < m.getUrgentCreditsTotal()) {
                m.setUrgentCreditsUsed(m.getUrgentCreditsUsed() + 1);
                sellerMembershipRepository.save(m);
                return true;
            }
        }
        return false;
    }

    private void applyOpeningHours(User user, List<UserOpeningHourRequest> openingHoursRequests) {
        List<UserOpeningHour> existingHours = user.getOpeningHours();
        if (existingHours == null) {
            existingHours = new ArrayList<>();
            user.setOpeningHours(existingHours);
        }
        existingHours.clear();

        for (UserOpeningHourRequest req : openingHoursRequests) {
            LocalTime openTime = null;
            LocalTime closeTime = null;
            if (Boolean.FALSE.equals(req.isClosed())) {
                if (req.openTime() != null && !req.openTime().isBlank()) {
                    openTime = LocalTime.parse(req.openTime().length() == 5 ? req.openTime() + ":00" : req.openTime());
                }
                if (req.closeTime() != null && !req.closeTime().isBlank()) {
                    closeTime = LocalTime.parse(req.closeTime().length() == 5 ? req.closeTime() + ":00" : req.closeTime());
                }
            }

            UserOpeningHour hour = UserOpeningHour.builder()
                    .user(user)
                    .dayOfWeek(req.dayOfWeek())
                    .isClosed(Boolean.TRUE.equals(req.isClosed()))
                    .openTime(openTime)
                    .closeTime(closeTime)
                    .build();

            existingHours.add(hour);
        }
    }
}
