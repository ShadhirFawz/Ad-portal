import {
  publicRequest,
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
    await publicRequest<ApiResponse<Category[]>>(
      "/categories"
    );

  return response.data;
}

export async function getRootCategories(): Promise<Category[]> {
  const response =
    await publicRequest<ApiResponse<Category[]>>(
      "/categories/root"
    );

  return response.data;
}

export async function getCategory(idOrSlug: string): Promise<Category> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const endpoint = isUuid ? `/categories/${idOrSlug}` : `/categories/slug/${encodeURIComponent(idOrSlug)}`;
  const response =
    await publicRequest<ApiResponse<Category>>(
      endpoint
    );

  return response.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response =
    await publicRequest<ApiResponse<Category>>(
      `/categories/slug/${encodeURIComponent(slug)}`
    );

  return response.data;
}

export async function getCategoryBreadcrumbs(idOrSlug: string): Promise<CategoryBreadcrumb[]> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const endpoint = isUuid ? `/categories/${idOrSlug}/breadcrumbs` : `/categories/slug/${encodeURIComponent(idOrSlug)}/breadcrumbs`;
  const response =
    await publicRequest<ApiResponse<CategoryBreadcrumb[]>>(
      endpoint
    );

  return response.data;
}

export async function getCategoryBreadcrumbsBySlug(slug: string): Promise<CategoryBreadcrumb[]> {
  const response =
    await publicRequest<ApiResponse<CategoryBreadcrumb[]>>(
      `/categories/slug/${encodeURIComponent(slug)}/breadcrumbs`
    );

  return response.data;
}