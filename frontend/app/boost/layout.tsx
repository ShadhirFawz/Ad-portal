import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Boost Center | Wudo",
  description:
    "Boost your listing with Spotlight, Push Up, Urgent, or Power Pack. Get up to 10× more visibility and sell faster on Wudo.",
};

export default function BoostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
