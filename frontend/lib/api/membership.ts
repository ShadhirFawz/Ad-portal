import { apiRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type {
  MembershipPricingPlan,
  SellerMembership,
  InitiateMembershipRequest,
  InitiateMembershipResponse,
} from "@/types/membership";

export async function getMembershipPlans(
  rootCategoryId?: string,
  accessToken?: string | null
): Promise<MembershipPricingPlan[]> {
  const query = rootCategoryId ? `?rootCategoryId=${encodeURIComponent(rootCategoryId)}` : "";
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await apiRequest<ApiResponse<MembershipPricingPlan[]>>(
    `/membership/plans${query}`,
    {
      headers,
    }
  );

  return response.data;
}

export async function getMyActiveMembership(
  accessToken: string
): Promise<SellerMembership | null> {
  const response = await apiRequest<ApiResponse<SellerMembership | null>>(
    "/membership/my-membership",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function initiateMembership(
  accessToken: string,
  payload: InitiateMembershipRequest
): Promise<InitiateMembershipResponse> {
  const response = await apiRequest<ApiResponse<InitiateMembershipResponse>>(
    "/membership/initiate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  return response.data;
}

export async function confirmSandboxMembership(
  accessToken: string,
  membershipId: string
): Promise<SellerMembership> {
  const response = await apiRequest<ApiResponse<SellerMembership>>(
    "/membership/confirm-sandbox",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ membershipId }),
    }
  );

  return response.data;
}

export async function confirmMembershipPayment(
  orderId: string,
  paymentId?: string | null,
  accessToken?: string | null
): Promise<SellerMembership> {
  const query = new URLSearchParams({ orderId });
  if (paymentId) query.set("paymentId", paymentId);
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await apiRequest<ApiResponse<SellerMembership>>(
    `/membership/confirm-payment?${query.toString()}`,
    {
      method: "POST",
      headers,
    }
  );

  return response.data;
}
