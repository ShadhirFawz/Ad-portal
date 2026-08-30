package com.marketplace.marketplace.user.repository;

import com.marketplace.marketplace.user.entity.UserPhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPhoneNumberRepository extends JpaRepository<UserPhoneNumber, UUID> {

    List<UserPhoneNumber> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<UserPhoneNumber> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, UUID userId);

    void deleteByUserId(UUID userId);
}
