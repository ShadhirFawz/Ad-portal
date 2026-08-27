import {
  apiRequest,
  publicRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
} from "@/types/auth";

import type {
  CreateListingRequest,
  Listing,
  UpdateListingRequest,
} from "@/types/listing";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function createListing(
  accessToken: string | undefined | null,
  request: CreateListingRequest
): Promise<Listing> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<ApiResponse<Listing>>(
      "/listings",
      {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function getListing(
  id: string
): Promise<Listing> {

  const response =
    await apiRequest<ApiResponse<Listing>>(
      `/listings/${id}`
    );

  return response.data;
}

export async function updateListing(
  accessToken: string | undefined | null,
  id: string,
  request: UpdateListingRequest
): Promise<Listing> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<ApiResponse<Listing>>(
      `/listings/${id}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function deleteListing(
  accessToken: string | undefined | null,
  id: string
): Promise<void> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  await apiRequest<ApiResponse<null>>(
    `/listings/${id}`,
    {
      method: "DELETE",
      headers,
    }
  );
}

export async function publishListing(
  accessToken: string | undefined | null,
  id: string
): Promise<Listing> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<ApiResponse<Listing>>(
      `/listings/${id}/publish`,
      {
        method: "POST",
        headers,
      }
    );

  return response.data;
}

export async function getMyListings(
  accessToken?: string | null,
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings/mine?page=${page}&size=${size}`,
      {
        headers,
      }
    );

  return response.data;
}

export async function getListings(
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {

  const response =
    await publicRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings?page=${page}&size=${size}`
    );

  return response.data;
}

export async function getListingsByCategory(
  categoryId: string,
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {

  const response =
    await publicRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings/category/${categoryId}?page=${page}&size=${size}`
    );

  return response.data;
}