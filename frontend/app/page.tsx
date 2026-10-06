import DashboardClient from "@/components/dashboard/DashboardClient";
import { getListings } from "@/lib/api/listings";
import { getRootCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";

export const revalidate = 60;

export default async function Home() {
  let categories: Category[] = [];
  let initialListings: Listing[] = [];
  let initialCategoryListings: Listing[] = [];

  try {
    const [cats, listingsRes] = await Promise.all([
      getRootCategories().catch(() => [] as Category[]),
      getListings({ page: 0, size: 36, sortBy: "newest", status: "ACTIVE" }).catch(() => ({ content: [] })),
    ]);

    categories = cats ?? [];
    initialListings = listingsRes?.content ?? [];

    const firstCat = categories[0];
    if (firstCat?.slug) {
      const catRes = await getListings({
        category: firstCat.slug,
        page: 0,
        size: 8,
        status: "ACTIVE",
        sortBy: "createdAt,desc",
      }).catch(() => ({ content: [] }));

      initialCategoryListings = catRes?.content ?? [];
    }
  } catch (err) {
    console.error("Server pre-fetch error for dashboard:", err);
  }

  return (
    <DashboardClient
      categories={categories}
      initialListings={initialListings}
      initialCategoryListings={initialCategoryListings}
    />
  );
}
