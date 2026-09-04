import { apiRequest, publicRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type {
  AuctionPublicResponse,
  AuctionSellerResponse,
  PlaceBidResponse,
} from "@/types/auction";

export async function getAuction(
  listingId: string,
  accessToken?: string | null
): Promise<AuctionPublicResponse | null> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = accessToken
    ? await apiRequest<ApiResponse<AuctionPublicResponse | null>>(
        `/listings/${listingId}/auction`,
        { headers }
      )
    : await publicRequest<ApiResponse<AuctionPublicResponse | null>>(
        `/listings/${listingId}/auction`
      );

  return response.data ?? null;
}

export async function startAuction(
  listingId: string,
  accessToken: string
): Promise<AuctionPublicResponse> {
  const response = await apiRequest<ApiResponse<AuctionPublicResponse>>(
    `/listings/${listingId}/auction/start`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({}),
    }
  );

  return response.data;
}

export async function placeBid(
  listingId: string,
  amount: number,
  accessToken: string
): Promise<PlaceBidResponse> {
  const response = await apiRequest<ApiResponse<PlaceBidResponse>>(
    `/listings/${listingId}/auction/bid`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ amount }),
    }
  );

  return response.data;
}

export async function getAuctionSellerView(
  listingId: string,
  accessToken: string
): Promise<AuctionSellerResponse> {
  const response = await apiRequest<ApiResponse<AuctionSellerResponse>>(
    `/listings/${listingId}/auction/seller`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data;
}
