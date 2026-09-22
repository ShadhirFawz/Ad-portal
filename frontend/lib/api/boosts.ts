import { apiRequest, publicRequest } from "./client";
import type {
  AdBoost,
  BoostCheckoutRequest,
  BoostCheckoutResponse,
  BoostPlan,
} from "@/types/boost";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export async function getBoostPlans(): Promise<BoostPlan[]> {
  const res = await publicRequest<ApiResponse<BoostPlan[]>>("/boosts/plans");
  return res.data;
}

export async function createBoostCheckout(
  request: BoostCheckoutRequest
): Promise<BoostCheckoutResponse> {
  const res = await apiRequest<ApiResponse<BoostCheckoutResponse>>(
    "/boosts/checkout",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
  return res.data;
}

export async function getMyBoosts(): Promise<AdBoost[]> {
  const res = await apiRequest<ApiResponse<AdBoost[]>>("/boosts/my");
  return res.data;
}

export async function getListingBoosts(listingId: string): Promise<AdBoost[]> {
  const res = await publicRequest<ApiResponse<AdBoost[]>>(
    `/boosts/listing/${listingId}`
  );
  return res.data;
}

export async function cancelScheduledBoost(boostId: string): Promise<void> {
  await apiRequest<ApiResponse<void>>(`/boosts/${boostId}/cancel`, {
    method: "POST",
  });
}

export async function confirmBoostPayment(
  orderId: string,
  paymentId?: string | null
): Promise<AdBoost> {
  const query = new URLSearchParams({ orderId });
  if (paymentId) {
    query.set("paymentId", paymentId);
  }
  const res = await apiRequest<ApiResponse<AdBoost>>(
    `/boosts/confirm-payment?${query.toString()}`,
    {
      method: "POST",
    }
  );
  return res.data;
}
