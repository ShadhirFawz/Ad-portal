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
  idOrSlug: string,
  accessToken?: string | null
): Promise<Listing> {

  if (accessToken) {
    const response =
      await apiRequest<ApiResponse<Listing>>(
        `/listings/${encodeURIComponent(idOrSlug)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    return response.data;
  }

  const response =
    await publicRequest<ApiResponse<Listing>>(
      `/listings/${encodeURIComponent(idOrSlug)}`
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

export interface ListingQueryParams {
  page?: number;
  size?: number;
  search?: string;
  condition?: string;
  pricingType?: string;
  listingType?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  category?: string;
}

export async function getListings(
  params?: ListingQueryParams | number,
  legacySize?: number
): Promise<PageResponse<Listing>> {
  const queryParams: ListingQueryParams =
    typeof params === "number"
      ? { page: params, size: legacySize ?? 20 }
      : (params ?? {});

  const {
    page = 0,
    size = 20,
    search,
    condition,
    pricingType,
    listingType,
    minPrice,
    maxPrice,
    sortBy,
    category,
  } = queryParams;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  if (search && search.trim()) {
    searchParams.set("search", search.trim());
  }
  if (condition && condition.trim()) {
    searchParams.set("condition", condition.trim());
  }
  if (pricingType && pricingType.trim()) {
    searchParams.set("pricingType", pricingType.trim());
  }
  if (listingType && listingType.trim()) {
    searchParams.set("listingType", listingType.trim());
  }
  if (minPrice && minPrice.trim()) {
    searchParams.set("minPrice", minPrice.trim());
  }
  if (maxPrice && maxPrice.trim()) {
    searchParams.set("maxPrice", maxPrice.trim());
  }

  if (sortBy) {
    const sortMap: Record<string, string> = {
      newest: "createdAt,desc",
      oldest: "createdAt,asc",
      price_asc: "price,asc",
      price_desc: "price,desc",
    };
    const sortValue = sortMap[sortBy] || sortBy;
    searchParams.set("sort", sortValue);
  }

  const endpoint = category
    ? `/listings/category/${encodeURIComponent(category)}?${searchParams.toString()}`
    : `/listings?${searchParams.toString()}`;

  const response =
    await publicRequest<
      ApiResponse<PageResponse<Listing>>
    >(endpoint);

  return response.data;
}

export async function getListingsByUsername(
  username: string,
  page = 0,
  size = 20
): Promise<PageResponse<Listing>> {
  const response =
    await publicRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings/user/${encodeURIComponent(username)}?page=${page}&size=${size}`
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

export async function getSimilarListings(
  categoryIdOrSlug: string,
  excludeIdOrSlug?: string,
  page = 0,
  size = 10
): Promise<PageResponse<Listing>> {

  const excludeParam = excludeIdOrSlug
    ? `&exclude=${encodeURIComponent(excludeIdOrSlug)}`
    : "";

  const response =
    await publicRequest<
      ApiResponse<PageResponse<Listing>>
    >(
      `/listings/category/${encodeURIComponent(categoryIdOrSlug)}/similar?page=${page}&size=${size}${excludeParam}`
    );

  return response.data;
}