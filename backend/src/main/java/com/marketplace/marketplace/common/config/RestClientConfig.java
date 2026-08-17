package com.marketplace.marketplace.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    RestClient supabaseRestClient(
            SupabaseProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getUrl())
                .defaultHeader(
                        "apikey",
                        properties.getSecretKey())
                .defaultHeader(
                        "Authorization",
                        "Bearer " + properties.getSecretKey())
                .build();
    }
}