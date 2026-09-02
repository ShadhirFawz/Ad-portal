export type AuctionStatus = "ACTIVE" | "CLOSED";

export interface AuctionBidderPreview {
  bidderId: string;
  avatarUrl: string | null;
  initial: string;
}

export interface AuctionPublicResponse {
  id: string;
  listingId: string;
  status: AuctionStatus;
  startedAt: string;
  endsAt: string;
  currentHighestBid: number | null;
  participantCount: number;
  latestBidders: AuctionBidderPreview[];
  hasEnded: boolean;
  userHasBid: boolean;
  userCurrentBid: number | null;
}

export interface AuctionBidDetail {
  bidId: string;
  bidderUsername: string | null;
  bidderAvatarUrl: string | null;
  amount: number;
  placedAt: string;
  isWinning: boolean;
}

export interface AuctionSellerResponse {
  id: string;
  listingId: string;
  status: AuctionStatus;
  startedAt: string;
  endsAt: string;
  currentHighestBid: number | null;
  participantCount: number;
  bids: AuctionBidDetail[];
  hasEnded: boolean;
}

export interface PlaceBidResponse {
  bidId: string;
  amount: number;
  currentHighestBid: number;
  isWinning: boolean;
}
