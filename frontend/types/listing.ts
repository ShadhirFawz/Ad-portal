import { ListingImage } from "./listing-image";

export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "RESERVED"
  | "SOLD"
  | "EXPIRED"
  | "ARCHIVED"
  | "DELETED";

export type ListingCondition =
  | "NEW"
  | "LIKE_NEW"
  | "GOOD"
  | "FAIR"
  | "POOR";

export type ListingType =
  | "ITEM"
  | "SERVICE";

export type PricingType =
  | "FIXED"
  | "NEGOTIABLE"
  | "FREE"
  | "CONTACT_FOR_PRICE";

export type ListingLocationType =
  | "CITY"
  | "DISTRICT"
  | "PROVINCE"
  | "NATIONWIDE"
  | "ONLINE";

export type ModerationStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface Listing {

  id: string;

  sellerId: string;
  sellerUsername: string;
  sellerPhoneNumber?: string | null;

  categoryId: string;
  categoryName: string;

  title: string;
  description: string;

  price: number;
  currency: string;

  pricingType: PricingType;
  negotiable: boolean;
  minimumOfferPrice: number | null;

  listingType: ListingType;

  condition: ListingCondition;

  quantity: number;
  availableQuantity: number;

  locationType: ListingLocationType;

  district: string | null;
  province: string | null;
  city: string | null;
  postalCode: string | null;

  customAttributes: Record<string, unknown>;

  status: ListingStatus;

  moderationStatus: ModerationStatus;

  viewCount: number;
  favoriteCount: number;

  images: ListingImage[];
  primaryImage?: ListingCardImage | null;

  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateListingRequest {

  categoryId: string;
  title: string;
  description: string;
  price: number;
  pricingType: PricingType;
  negotiable: boolean;
  minimumOfferPrice?: number;
  listingType?: ListingType;
  condition: ListingCondition;
  quantity?: number;
  locationType?: ListingLocationType;
  district?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  customAttributes?: Record<string, unknown>;
}

export interface UpdateListingRequest {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  condition?: ListingCondition;
  location?: string;
  pricingType?: PricingType;
  negotiable?: boolean;
  minimumOfferPrice?: number;
  listingType?: ListingType;
  quantity?: number;
  locationType?: ListingLocationType;
  district?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  customAttributes?: Record<string, unknown>;
}

export interface ListingCardImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface ListingCardData {
  id: string;
  sellerId?: string;
  sellerUsername?: string;
  categoryId?: string;
  categoryName?: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  pricingType?: PricingType;
  negotiable?: boolean;
  listingType?: ListingType;
  condition?: ListingCondition;
  locationType?: ListingLocationType;
  district?: string | null;
  province?: string | null;
  city?: string | null;
  status?: ListingStatus;
  primaryImage?: ListingCardImage | null;
  images?: ListingImage[];
  viewCount?: number;
  favoriteCount?: number;
  publishedAt?: string | null;
  createdAt?: string;
}