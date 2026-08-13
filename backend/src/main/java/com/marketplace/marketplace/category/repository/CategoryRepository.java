package com.marketplace.marketplace.category.repository;

import com.marketplace.marketplace.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository
        extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    List<Category> findAllByActiveTrueOrderByDisplayOrderAsc();

    List<Category> findAllByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();
}
