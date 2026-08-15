import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
} from "@/types/auth";

import type {
  Category,
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