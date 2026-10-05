import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

function getSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_HOST;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_KEY;

  if (!url || !key) {
    console.error("[semantic-search] Missing Supabase environment variables.");
    return null;
  }
  return { supabase: createClient(url, key), supabaseUrl: url };
}

function resolveImageUrl(storagePath?: string | null, supabaseUrl?: string): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  if (!supabaseUrl) return storagePath;
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/listing-images/${storagePath.replace(/^\//, "")}`;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "and", "or", "is", "are", "was", "were", "be", "been", "good", "best",
  "used", "new", "condition", "item", "items", "buy", "sell", "looking",
  "want", "need", "cheap", "affordable", "free", "under", "like"
]);

function extractSearchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function calculateKeywordScore(tokens: string[], item: { title?: string; description?: string; city?: string }): number {
  if (tokens.length === 0) return 0;
  const text = `${item.title || ""} ${item.city || ""} ${(item.description || "").slice(0, 200)}`.toLowerCase();

  let matches = 0;
  for (const token of tokens) {
    if (text.includes(token)) {
      matches++;
    }
  }
  return matches / tokens.length;
}

function formatListings(rawListings: any[], supabaseUrl: string, similarityMap?: Map<string, number>) {
  return rawListings.map((item: any) => {
    const rawImages = (item.listing_images || []).sort(
      (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );

    const images = rawImages.map((img: any) => ({
      id: img.id,
      url: resolveImageUrl(img.storage_path, supabaseUrl),
      isPrimary: Boolean(img.is_primary),
      displayOrder: img.display_order ?? 0,
    }));

    const primaryImage =
      images.find((img: any) => img.isPrimary) || (images.length > 0 ? images[0] : null);

    const locationParts = [item.city, item.district, item.province].filter(Boolean);
    const locationText =
      locationParts.length > 0 ? locationParts.join(", ") : item.location || "";

    return {
      id: item.id,
      slug: item.slug || item.id,
      title: item.title,
      description: item.description,
      price: Number(item.price || 0),
      currency: item.currency || "LKR",
      condition: item.condition,
      pricingType: item.pricing_type || "FIXED",
      city: item.city,
      district: item.district,
      province: item.province,
      location: locationText,
      status: item.status,
      primaryImage,
      images,
      createdAt: item.created_at,
      similarity: similarityMap ? similarityMap.get(item.id) ?? 0 : 1,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query, limit = 12 } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const trimmedQuery = query.trim();
    const searchTokens = extractSearchTokens(trimmedQuery);
    const client = getSupabaseClient();

    if (!client) {
      return NextResponse.json({ results: [] });
    }

    const { supabase, supabaseUrl } = client;

    let matchedListings: any[] = [];
    let similarityMap = new Map<string, number>();

    // 1. Try vector semantic embedding search with dynamic import
    try {
      const { getEmbedding } = await import("@/lib/embeddings");
      const queryEmbedding = await getEmbedding(trimmedQuery);

      const { data: matched, error: rpcError } = await supabase.rpc("match_listings", {
        query_embedding: queryEmbedding,
        match_threshold: 0.32,
        match_count: Math.max(limit * 2, 20),
      });

      if (!rpcError && matched && matched.length > 0) {
        matchedListings = matched;
        similarityMap = new Map<string, number>(
          matched.map((item: any) => [item.id, Number(item.similarity ?? 0)])
        );
      }
    } catch (embErr) {
      console.warn("[semantic-search] Vector embedding search error (falling back):", embErr);
    }

    // 2. Fetch full listing details for vector matches
    if (matchedListings.length > 0) {
      const listingIds = matchedListings.map((item: any) => item.id);

      const { data: listings, error: fetchError } = await supabase
        .from("listings")
        .select(`
          id,
          slug,
          title,
          description,
          price,
          currency,
          condition,
          pricing_type,
          city,
          district,
          province,
          location,
          status,
          created_at,
          listing_images (
            id,
            storage_path,
            is_primary,
            display_order
          )
        `)
        .in("id", listingIds)
        .is("deleted_at", null);

      if (!fetchError && listings && listings.length > 0) {
        // Apply hybrid scoring & dynamic relative threshold
        const scored = listings.map((item: any) => {
          const similarity = similarityMap.get(item.id) ?? 0;
          const kwScore = calculateKeywordScore(searchTokens, item);
          const hybridScore = searchTokens.length > 0 ? similarity * 0.75 + kwScore * 0.25 : similarity;
          return { item, similarity, kwScore, hybridScore };
        });

        const maxSimilarity = Math.max(...scored.map((s) => s.similarity));
        const relativeCutoff = Math.max(0.36, maxSimilarity - 0.09);

        const filtered = scored.filter((s) => {
          if (searchTokens.length >= 2 && s.kwScore === 0 && s.similarity < maxSimilarity - 0.04) {
            return false;
          }
          return s.similarity >= relativeCutoff;
        });

        filtered.sort((a, b) => b.hybridScore - a.hybridScore);

        const formatted = formatListings(filtered.slice(0, limit).map((f) => f.item), supabaseUrl, similarityMap);
        return NextResponse.json({ results: formatted });
      }
    }

    // 3. Fallback: Text/ILIKE Search (guarantees results returned smoothly on Vercel without 500s)
    const { data: fallbackListings, error: fallbackError } = await supabase
      .from("listings")
      .select(`
        id,
        slug,
        title,
        description,
        price,
        currency,
        condition,
        pricing_type,
        city,
        district,
        province,
        location,
        status,
        created_at,
        listing_images (
          id,
          storage_path,
          is_primary,
          display_order
        )
      `)
      .or(`title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`)
      .is("deleted_at", null)
      .limit(limit);

    if (fallbackError) {
      console.error("[semantic-search] Fallback query error:", fallbackError);
      return NextResponse.json({ results: [] });
    }

    const formattedFallback = formatListings(fallbackListings || [], supabaseUrl);
    return NextResponse.json({ results: formattedFallback });
  } catch (err: any) {
    console.error("[semantic-search] Global handler error:", err);
    return NextResponse.json({ results: [] });
  }
}
