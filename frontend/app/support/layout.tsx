import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Center | Wudo",
  description:
    "Get help with listings, payments, boosts, account issues, and more. Browse our FAQ or contact the Wudo support team directly.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
