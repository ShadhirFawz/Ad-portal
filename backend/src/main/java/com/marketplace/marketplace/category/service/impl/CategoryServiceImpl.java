package com.marketplace.marketplace.category.service.impl;

import com.marketplace.marketplace.category.dto.response.CategoryBreadcrumbResponse;
import com.marketplace.marketplace.category.dto.response.CategoryResponse;
import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.category.service.CategoryService;
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

        @Override
        public List<CategoryBreadcrumbResponse> getBreadcrumbs(UUID categoryId) {

                Category category = categoryRepository
                                .findById(categoryId)
                                .filter(Category::isActive)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                return buildBreadcrumbs(category);
        }

        @Override
        public List<CategoryBreadcrumbResponse> getBreadcrumbsBySlug(String slug) {

                Category category = categoryRepository
                                .findBySlug(slug)
                                .filter(Category::isActive)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                return buildBreadcrumbs(category);
        }

        @Override
        public List<UUID> getSelfAndDescendantCategoryIds(UUID categoryId) {

                List<Category> allActive = categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc();

                java.util.Map<UUID, List<UUID>> parentToChildren = new java.util.HashMap<>();
                for (Category cat : allActive) {
                        if (cat.getParent() != null) {
                                parentToChildren
                                                .computeIfAbsent(cat.getParent().getId(), k -> new java.util.ArrayList<>())
                                                .add(cat.getId());
                        }
                }

                List<UUID> result = new java.util.ArrayList<>();
                result.add(categoryId);
                collectDescendantIds(categoryId, parentToChildren, result);

                return result;
        }

        @Override
        public UUID resolveCategoryId(String idOrSlug) {
                if (idOrSlug == null || idOrSlug.isBlank()) {
                        throw new ResourceNotFoundException("Category identifier is required.");
                }

                try {
                        UUID id = UUID.fromString(idOrSlug);
                        if (categoryRepository.existsById(id)) {
                                return id;
                        }
                } catch (IllegalArgumentException ignored) {
                        // idOrSlug is a slug, not a UUID
                }

                return categoryRepository
                                .findBySlug(idOrSlug)
                                .filter(Category::isActive)
                                .map(Category::getId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found: " + idOrSlug));
        }

        private List<CategoryBreadcrumbResponse> buildBreadcrumbs(Category category) {

                List<CategoryBreadcrumbResponse> breadcrumbs = new java.util.ArrayList<>();
                Category current = category;

                while (current != null) {
                        breadcrumbs.add(0, new CategoryBreadcrumbResponse(
                                        current.getId(),
                                        current.getName(),
                                        current.getSlug(),
                                        current.getLevel()));
                        current = current.getParent();
                }

                return breadcrumbs;
        }

        private void collectDescendantIds(UUID parentId, java.util.Map<UUID, List<UUID>> parentToChildren, List<UUID> accumulator) {

                List<UUID> children = parentToChildren.get(parentId);
                if (children != null) {
                        for (UUID childId : children) {
                                accumulator.add(childId);
                                collectDescendantIds(childId, parentToChildren, accumulator);
                        }
                }
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