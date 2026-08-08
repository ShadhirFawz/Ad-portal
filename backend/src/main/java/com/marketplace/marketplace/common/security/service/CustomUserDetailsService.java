package com.marketplace.marketplace.common.security.service;

import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()))
                .disabled(
                        user.getStatus() != com.marketplace.marketplace.common.enums.UserStatus.ACTIVE)
                .build();
    }
}