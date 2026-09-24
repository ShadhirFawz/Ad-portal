package com.marketplace.marketplace.promotion.dto.request;

public record BoostIpnRequest(
        String merchant_id,
        String order_id,
        String payment_id,
        String payhere_amount,
        String payhere_currency,
        String status_code,
        String md5sig,
        String custom_1,
        String custom_2,
        String method,
        String status_message,
        String card_holder_name,
        String card_no,
        String card_expiry
) {
}
