export type BoostType = "SPOTLIGHT" | "PUSH_UP" | "HOT_DEAL" | "POWER_PACK";

export type BoostDuration = "THREE_DAYS" | "SEVEN_DAYS" | "FOURTEEN_DAYS" | "THIRTY_DAYS";

export type BoostStatus = "PENDING_PAYMENT" | "SCHEDULED" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface BoostPricingTier {
  id: string;
  duration: BoostDuration;
  durationDays: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  priceAfterDiscount: number;
  taxPercentage: number;
  taxAmount: number;
  finalPrice: number;
  isActive: boolean;
}

export interface BoostPlan {
  boostType: BoostType;
  name: string;
  badgeText: string;
  description: string;
  highlights: string[];
  badgeColor: "amber" | "emerald" | "rose" | "purple" | string;
  pricing: Record<BoostDuration, number>;
  pricingTiers?: BoostPricingTier[];
}

export interface BoostCheckoutRequest {
  listingId: string;
  boostType: BoostType;
  duration: BoostDuration;
  scheduledStartTime?: string | null;
}

export interface BoostCheckoutResponse {
  boostSubscriptionId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  payHereCheckoutUrl: string;
  payHereParams: Record<string, string>;
}

export interface AdBoost {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  boostType: BoostType;
  boostStatus: BoostStatus;
  durationDays: number;
  startsAt: string;
  expiresAt: string;
  activatedAt?: string | null;
  createdAt: string;
}
