export interface AccountSetupStepItem {
  key: "USERNAME" | "PHONE_NUMBER" | "DESCRIPTION" | "FIRST_LISTING" | "AUCTION_PARTICIPATION" | string;
  title: string;
  description: string;
  completed: boolean;
  actionUrl: string;
  actionLabel: string;
}

export interface AccountSetupProgress {
  completedCount: number;
  totalCount: number;
  percentage: number;
  isFullyCompleted: boolean;
  steps: AccountSetupStepItem[];
}
