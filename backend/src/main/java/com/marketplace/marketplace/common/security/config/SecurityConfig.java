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

                                                .requestMatchers(
                                                                "/api/v1/auth/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/users/*")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/v1/categories/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**")
                                                .permitAll()

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