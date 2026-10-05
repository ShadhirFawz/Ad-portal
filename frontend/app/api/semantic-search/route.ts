import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/embeddings";

function resolveImageUrl(storagePath?: string | null, supabaseUrl?: string): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  if (!supabaseUrl) return storagePath;
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/listing-images/${storagePath.replace(/^\//, "")}`;
}

// Stop words that do not indicate specific entity/product intent
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

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 12 } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const trimmedQuery = query.trim();
    const searchTokens = extractSearchTokens(trimmedQuery);

    // 1. Generate embedding for user query
    const queryEmbedding = await getEmbedding(trimmedQuery);

    // 2. Call the match_listings Supabase RPC with an initial threshold
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: matched, error: rpcError } = await supabase.rpc("match_listings", {
      query_embedding: queryEmbedding,
      match_threshold: 0.32,
      match_count: Math.max(limit * 2, 20),
    });

    if (rpcError) {
      console.error("[semantic-search] Supabase RPC error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    if (!matched || matched.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const listingIds = matched.map((item: any) => item.id);
    const similarityMap = new Map<string, number>(
      matched.map((item: any) => [item.id, Number(item.similarity ?? 0)])
    );

    // 3. Fetch comprehensive details for matched listings
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

    if (fetchError) {
      console.error("[semantic-search] Error fetching listing details:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const rawListings = listings || [];
    if (rawListings.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 4. Calculate hybrid score & filter noise using dynamic relative threshold
    const scoredListings = rawListings.map((item: any) => {
      const similarity = similarityMap.get(item.id) ?? 0;
      const kwScore = calculateKeywordScore(searchTokens, item);

      // Hybrid score: 75% vector semantic similarity + 25% keyword match
      const hybridScore = searchTokens.length > 0
        ? similarity * 0.75 + kwScore * 0.25
        : similarity;

      return {
        item,
        similarity,
        kwScore,
        hybridScore,
      };
    });

    // Find the highest similarity score
    const maxSimilarity = Math.max(...scoredListings.map((s) => s.similarity));

    // Dynamic threshold: items must be at least 0.36 AND within 0.09 of the top match
    const relativeCutoff = Math.max(0.36, maxSimilarity - 0.09);

    const filtered = scoredListings.filter((s) => {
      // If the query has specific keywords and item has 0 keyword matches and low similarity, drop it
      if (searchTokens.length >= 2 && s.kwScore === 0 && s.similarity < maxSimilarity - 0.04) {
        return false;
      }
      return s.similarity >= relativeCutoff;
    });

    // Sort by hybrid score descending
    filtered.sort((a, b) => b.hybridScore - a.hybridScore);

    // 5. Format the top results
    const results = filtered.slice(0, limit).map(({ item, similarity }) => {
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
        similarity,
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("[semantic-search] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
