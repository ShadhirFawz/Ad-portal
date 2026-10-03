package com.marketplace.marketplace.promotion.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payhere")
@Getter
@Setter
public class PayHereProperties {

    private String merchantId = "1211111";
    private String merchantSecret = "sandbox_secret";
    private String baseUrl = "https://sandbox.payhere.lk";
    private String notifyUrl = "http://localhost:8080/api/v1/boosts/notify";
    private String returnUrl = "http://localhost:3000/promotions/success";
    private String cancelUrl = "http://localhost:3000/promotions/cancel";
    private String membershipNotifyUrl;
    private String membershipReturnUrl;
    private String membershipCancelUrl;
    private String currency = "LKR";

    public String getMembershipNotifyUrl() {
        if (membershipNotifyUrl != null && !membershipNotifyUrl.isBlank()) {
            return membershipNotifyUrl;
        }
        if (notifyUrl != null && notifyUrl.contains("/api/v1/boosts/notify")) {
            return notifyUrl.replace("/api/v1/boosts/notify", "/api/v1/membership/payhere-notify");
        }
        return "http://localhost:8080/api/v1/membership/payhere-notify";
    }

    public String getMembershipReturnUrl() {
        if (membershipReturnUrl != null && !membershipReturnUrl.isBlank()) {
            return membershipReturnUrl;
        }
        if (returnUrl != null && returnUrl.contains("/promotions/success")) {
            return returnUrl.replace("/promotions/success", "/membership/success");
        }
        return "http://localhost:3000/membership/success";
    }

    public String getMembershipCancelUrl() {
        if (membershipCancelUrl != null && !membershipCancelUrl.isBlank()) {
            return membershipCancelUrl;
        }
        if (cancelUrl != null && cancelUrl.contains("/promotions/cancel")) {
            return cancelUrl.replace("/promotions/cancel", "/membership/cancel");
        }
        return "http://localhost:3000/membership/cancel";
    }
}
