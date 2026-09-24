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
    private String currency = "LKR";
}
