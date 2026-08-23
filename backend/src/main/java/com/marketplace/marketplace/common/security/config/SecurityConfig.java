package com.marketplace.marketplace.common.security.config;

import com.marketplace.marketplace.common.security.filter.JwtAuthenticationFilter;
import com.marketplace.marketplace.common.security.handler.CustomAccessDeniedHandler;
import com.marketplace.marketplace.common.security.handler.CustomAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CorsProperties corsProperties;
        private final CustomAuthenticationEntryPoint authenticationEntryPoint;
        private final CustomAccessDeniedHandler accessDeniedHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        CorsConfigurationSource corsConfigurationSource) throws Exception {

                http
                                .csrf(AbstractHttpConfigurer::disable)

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource))

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(authenticationEntryPoint)
                                                .accessDeniedHandler(accessDeniedHandler))

                                .authorizeHttpRequests(auth -> auth

                                // ── Root ──────────────────────────────────────
                                .requestMatchers(HttpMethod.GET, "/")
                                .permitAll()

                                // ── Swagger / OpenAPI ─────────────────────────
                                .requestMatchers(
                                                "/swagger-ui/**",
                                                "/swagger-ui.html",
                                                "/v3/api-docs/**")
                                .permitAll()

                                // ── Auth — requires authentication ────────────
                                .requestMatchers(HttpMethod.GET, "/api/v1/auth/me")
                                .authenticated()

                                .requestMatchers(HttpMethod.POST, "/api/v1/auth/sync")
                                .authenticated()

                                // ── Users — public ────────────────────────────
                                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}")
                                .permitAll()

                                // ── Users — requires authentication ───────────
                                .requestMatchers(HttpMethod.GET, "/api/v1/users/me")
                                .authenticated()

                                .requestMatchers(HttpMethod.PATCH, "/api/v1/users/me")
                                .authenticated()

                                .requestMatchers(HttpMethod.PATCH, "/api/v1/users/me/password")
                                .authenticated()

                                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/me")
                                .authenticated()

                                // ── Categories — all public (read-only) ───────
                                .requestMatchers(HttpMethod.GET, "/api/v1/categories")
                                .permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/v1/categories/root")
                                .permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/v1/categories/slug/{slug}")
                                .permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/v1/categories/{id}")
                                .permitAll()

                                // ── Listings — public reads ───────────────────
                                .requestMatchers(HttpMethod.GET, "/api/v1/listings")
                                .permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/v1/listings/category/{categoryId}")
                                .permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/v1/listings/{id}")
                                .permitAll()

                                // ── Listings — requires authentication ────────
                                .requestMatchers(HttpMethod.GET, "/api/v1/listings/mine")
                                .authenticated()

                                .requestMatchers(HttpMethod.POST, "/api/v1/listings")
                                .authenticated()

                                .requestMatchers(HttpMethod.PATCH, "/api/v1/listings/{id}")
                                .authenticated()

                                .requestMatchers(HttpMethod.DELETE, "/api/v1/listings/{id}")
                                .authenticated()

                                .requestMatchers(HttpMethod.POST, "/api/v1/listings/{id}/publish")
                                .authenticated()

                                // ── Deny everything else ──────────────────────
                                .anyRequest()
                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                corsProperties.allowedOrigins());

                configuration.setAllowedMethods(
                                corsProperties.allowedMethods());

                configuration.setAllowedHeaders(
                                corsProperties.allowedHeaders());

                configuration.setAllowCredentials(
                                corsProperties.allowCredentials());

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}