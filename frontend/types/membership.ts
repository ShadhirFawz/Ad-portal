import type { OpeningHour } from "@/lib/openingHours";

export type PlanTier = "PRO" | "PREMIUM";
export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type MembershipStatus = "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface MembershipPricingPlan {
  id: string;
  rootCategoryId: string;
  rootCategoryName?: string;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  durationDays: number;
  basePrice: number;
  listingLimit: number;
  bonusSpotlightCount: number;
  bonusPushUpCount: number;
  bonusUrgentCount: number;
  isActive: boolean;
}

export interface SellerMembership {
  id: string;
  userId: string;
  rootCategoryId: string;
  rootCategoryName: string;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  listingLimit: number;
  listingsUsed: number;
  remainingListings: number;
  spotlightCreditsTotal: number;
  spotlightCreditsUsed: number;
  remainingSpotlights: number;
  pushUpCreditsTotal: number;
  pushUpCreditsUsed: number;
  remainingPushUps: number;
  urgentCreditsTotal: number;
  urgentCreditsUsed: number;
  remainingUrgents: number;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  bio: string | null;
  isActive: boolean;
}

export interface InitiateMembershipRequest {
  rootCategoryId: string;
  pricingPlanId: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  bio?: string;
  openingHours?: OpeningHour[];
}

export interface InitiateMembershipResponse {
  membershipId: string;
  orderId: string;
  amount: number;
  currency: string;
  merchantId: string;
  hash: string;
  planTier: string;
  billingCycle: string;
  rootCategoryName: string;
  payHereCheckoutUrl: string;
  payHereParams: Record<string, string>;
}
