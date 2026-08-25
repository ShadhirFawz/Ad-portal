package com.marketplace.marketplace.category.service;

import com.marketplace.marketplace.category.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<CategoryResponse> getActiveCategories();

    List<CategoryResponse> getRootCategories();

    CategoryResponse getBySlug(String slug);

    CategoryResponse getById(UUID id);
}