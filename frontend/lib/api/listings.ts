import {
  apiRequest,
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
  accessToken: string,
  request: CreateListingRequest
): Promise<Listing> {

  const response =
    await apiRequest<ApiResponse<Listing>>(
      "/listings",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
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
  accessToken: string,
  id: string,
  request: UpdateListingRequest
): Promise<Listing> {

  const response =
    await apiRequest<ApiResponse<Listing>>(
      `/listings/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function deleteListing(
  accessToken: string,
  id: string
): Promise<void> {

  await apiRequest<ApiResponse<null>>(
    `/listings/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );
}

export async function publishListing(
  accessToken: string,
  id: string
): Promise<Listing> {

  const response =
    await apiRequest<ApiResponse<Listing>>(
      `/listings/${id}/publish`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

  return response.data;
}

export async function getMyListings(
  accessToken: string,
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {

  const response =
    await apiRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings/mine?page=${page}&size=${size}`,
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

  return response.data;
}

export async function getListings(
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {

  const response =
    await apiRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings?page=${page}&size=${size}`
    );

  return response.data;
}