package com.marketplace.marketplace.category.controller;

import com.marketplace.marketplace.category.dto.response.CategoryResponse;
import com.marketplace.marketplace.category.service.CategoryService;
import com.marketplace.marketplace.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories() {

        return ApiResponse.success(
                "Categories retrieved successfully.",
                categoryService.getActiveCategories());
    }

    @GetMapping("/root")
    public ApiResponse<List<CategoryResponse>> getRootCategories() {

        return ApiResponse.success(
                "Root categories retrieved successfully.",
                categoryService.getRootCategories());
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategory(
            @PathVariable UUID id) {

        return ApiResponse.success(
                "Category retrieved successfully.",
                categoryService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<CategoryResponse> getCategoryBySlug(
            @PathVariable String slug) {

        return ApiResponse.success(
                "Category retrieved successfully.",
                categoryService.getBySlug(slug));
    }
}