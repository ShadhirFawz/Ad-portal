package com.marketplace.marketplace.category.service;

import com.marketplace.marketplace.category.dto.response.CategoryResponse;
import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

        private final CategoryRepository categoryRepository;

        @Override
        public List<CategoryResponse> getActiveCategories() {

                return categoryRepository
                                .findAllByActiveTrueOrderByDisplayOrderAsc()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Override
        public List<CategoryResponse> getRootCategories() {

                return categoryRepository
                                .findAllByParentIsNullAndActiveTrueOrderByDisplayOrderAsc()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Override
        public CategoryResponse getBySlug(String slug) {

                Category category = categoryRepository
                                .findBySlug(slug)
                                .filter(Category::isActive)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                return toResponse(category);
        }

        @Override
        public CategoryResponse getById(UUID id) {

                Category category = categoryRepository
                                .findById(id)
                                .filter(Category::isActive)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                return toResponse(category);
        }

        private CategoryResponse toResponse(
                        Category category) {

                return new CategoryResponse(
                                category.getId(),
                                category.getName(),
                                category.getSlug(),
                                category.getCode(),
                                category.getDescription(),
                                category.getParent() != null
                                                ? category.getParent().getId()
                                                : null,
                                category.getLevel(),
                                category.isAllowListings(),
                                category.getIconUrl(),
                                category.getDisplayOrder(),
                                category.isActive(),
                                category.getMetadata());
        }
}