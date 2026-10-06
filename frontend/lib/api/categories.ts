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

let allCategoriesCache: { data: Category[]; timestamp: number } | null = null;
let rootCategoriesCache: { data: Category[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCategories(): Promise<Category[]> {
  if (allCategoriesCache && Date.now() - allCategoriesCache.timestamp < CACHE_TTL_MS) {
    return allCategoriesCache.data;
  }

  const response = await publicRequest<ApiResponse<Category[]>>("/categories");
  allCategoriesCache = { data: response.data ?? [], timestamp: Date.now() };
  return allCategoriesCache.data;
}

export async function getRootCategories(): Promise<Category[]> {
  if (rootCategoriesCache && Date.now() - rootCategoriesCache.timestamp < CACHE_TTL_MS) {
    return rootCategoriesCache.data;
  }

  const response = await publicRequest<ApiResponse<Category[]>>("/categories/root");
  rootCategoriesCache = { data: response.data ?? [], timestamp: Date.now() };
  return rootCategoriesCache.data;
}

export async function getCategory(idOrSlug: string): Promise<Category> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const endpoint = isUuid ? `/categories/${idOrSlug}` : `/categories/slug/${encodeURIComponent(idOrSlug)}`;
  const response = await publicRequest<ApiResponse<Category>>(endpoint);
  return response.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await publicRequest<ApiResponse<Category>>(
    `/categories/slug/${encodeURIComponent(slug)}`
  );
  return response.data;
}

export async function getCategoryBreadcrumbs(idOrSlug: string): Promise<CategoryBreadcrumb[]> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const endpoint = isUuid ? `/categories/${idOrSlug}/breadcrumbs` : `/categories/slug/${encodeURIComponent(idOrSlug)}/breadcrumbs`;
  const response = await publicRequest<ApiResponse<CategoryBreadcrumb[]>>(endpoint);
  return response.data;
}

export async function getCategoryBreadcrumbsBySlug(slug: string): Promise<CategoryBreadcrumb[]> {
  const response = await publicRequest<ApiResponse<CategoryBreadcrumb[]>>(
    `/categories/slug/${encodeURIComponent(slug)}/breadcrumbs`
  );
  return response.data;
}