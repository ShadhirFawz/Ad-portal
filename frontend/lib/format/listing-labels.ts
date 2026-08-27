import type {
  ListingCondition,
  ListingLocationType,
  ListingStatus,
  ListingType,
  ModerationStatus,
  PricingType,
} from "@/types/listing";

export function formatListingCondition(
  condition: ListingCondition | string
): string {
  switch (condition) {
    case "NEW":
      return "Brand New";
    case "LIKE_NEW":
      return "Like New";
    case "GOOD":
      return "Good Condition";
    case "FAIR":
      return "Fair";
    case "POOR":
      return "For Parts / Poor";
    case "REFURBISHED":
      return "Refurbished";
    case "NOT_APPLICABLE":
      return "Not Applicable";
    default:
      return condition;
  }
}

export function formatListingType(type: ListingType | string): string {
  switch (type) {
    case "ITEM":
      return "Physical Item";
    case "SERVICE":
      return "Service";
    default:
      return type;
  }
}

export function formatPricingType(type: PricingType | string): string {
  switch (type) {
    case "FIXED":
      return "Fixed Price";
    case "NEGOTIABLE":
      return "Negotiable";
    case "FREE":
      return "Free";
    case "CONTACT_FOR_PRICE":
      return "Contact for Price";
    default:
      return type;
  }
}

export function formatLocationType(type: ListingLocationType | string): string {
  switch (type) {
    case "CITY":
      return "Specific City";
    case "DISTRICT":
      return "District-Wide";
    case "PROVINCE":
      return "Province-Wide";
    case "NATIONWIDE":
      return "Island-Wide Delivery";
    case "ONLINE":
      return "Digital / Remote";
    default:
      return type;
  }
}

export function formatListingStatus(status: ListingStatus | string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "ACTIVE":
      return "Active";
    case "RESERVED":
      return "Reserved";
    case "SOLD":
      return "Sold";
    case "EXPIRED":
      return "Expired";
    case "ARCHIVED":
      return "Archived";
    case "DELETED":
      return "Deleted";
    default:
      return status;
  }
}

export function formatModerationStatus(
  status: ModerationStatus | string
): string {
  switch (status) {
    case "NOT_REQUIRED":
      return "Not Required";
    case "PENDING":
      return "Pending Review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function formatListingPrice(listing: {
  pricingType?: PricingType | string;
  price?: number;
  currency?: string;
}): string {
  if (listing.pricingType === "FREE") return "Free";
  if (listing.pricingType === "CONTACT_FOR_PRICE") return "Contact for Price";

  const currency = listing.currency ?? "LKR";
  const amount =
    typeof listing.price === "number"
      ? listing.price.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : listing.price;

  return `${currency} ${amount}`;
}
