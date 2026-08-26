import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
} from "@/types/auth";

import type {
  Category,
  CategoryBreadcrumb,
} from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response =
    await apiRequest<ApiResponse<Category[]>>(
      "/categories"
    );

  return response.data;
}

export async function getRootCategories(): Promise<Category[]> {
  const response =
    await apiRequest<ApiResponse<Category[]>>(
      "/categories/root"
    );

  return response.data;
}

export async function getCategory(id: string): Promise<Category> {
  const response =
    await apiRequest<ApiResponse<Category>>(
      `/categories/${id}`
    );

  return response.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response =
    await apiRequest<ApiResponse<Category>>(
      `/categories/slug/${encodeURIComponent(slug)}`
    );

  return response.data;
}

export async function getCategoryBreadcrumbs(id: string): Promise<CategoryBreadcrumb[]> {
  const response =
    await apiRequest<ApiResponse<CategoryBreadcrumb[]>>(
      `/categories/${id}/breadcrumbs`
    );

  return response.data;
}

export async function getCategoryBreadcrumbsBySlug(slug: string): Promise<CategoryBreadcrumb[]> {
  const response =
    await apiRequest<ApiResponse<CategoryBreadcrumb[]>>(
      `/categories/slug/${encodeURIComponent(slug)}/breadcrumbs`
    );

  return response.data;
}