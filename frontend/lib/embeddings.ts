import { pipeline, env } from '@huggingface/transformers';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import os from 'os';

// Configure transformers environment for Vercel Serverless / Node runtime
if (typeof window === 'undefined') {
    const cacheDir = path.join(os.tmpdir(), 'huggingface_cache');
    env.cacheDir = cacheDir;
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    process.env.HF_HOME = cacheDir;
    process.env.TRANSFORMERS_CACHE = cacheDir;

    if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = false;
    }
}

let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            { dtype: 'q8' }
        ).catch((err) => {
            extractorPromise = null;
            throw err;
        });
    }
    return extractorPromise;
}

export async function getEmbedding(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
    });
    return Array.from(output.data) as number[];
}

/**
 * Builds high-fidelity text for embedding generation.
 * Anchors the vector strongly to title and category while including condition and cleaned description.
 */
export function buildListingEmbeddingText(listing: {
    title?: string | null;
    description?: string | null;
    categoryName?: string | null;
    condition?: string | null;
    city?: string | null;
    district?: string | null;
    province?: string | null;
    location?: string | null;
}): string {
    const title = (listing.title || '').trim();
    const category = (listing.categoryName || '').trim();
    const condition = (listing.condition || '').replace(/_/g, ' ').trim();
    const location =
        [listing.city, listing.district, listing.province].filter(Boolean).join(', ') ||
        (listing.location || '').trim();

    // Clean description to avoid dilution from boilerplate or HTML
    const cleanDescription = (listing.description || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 300)
        .trim();

    const parts: string[] = [];
    if (title) parts.push(title);
    if (category) parts.push(`Category: ${category}`);
    if (title) parts.push(title); // Repeated to prioritize entity name over generic words
    if (condition) parts.push(`Condition: ${condition}`);
    if (location) parts.push(`Location: ${location}`);
    if (cleanDescription) parts.push(cleanDescription);

    return parts.join('. ');
}

/**
 * Generate the text that will be embedded and update the listing
 */
export async function updateListingEmbedding(listingId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials for updating embedding');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch the latest listing data
    const { data: listing, error } = await supabase
        .from('listings')
        .select(`
      id,
      title,
      description,
      price,
      currency,
      condition,
      city,
      district,
      province,
      location,
      categories:category_id ( name )
    `)
        .eq('id', listingId)
        .single();

    if (error || !listing) {
        console.error('Could not fetch listing for embedding:', error);
        return;
    }

    // 2. Build structured text
    const categoryName = (listing.categories as any)?.name || '';
    const text = buildListingEmbeddingText({
        title: listing.title,
        description: listing.description,
        categoryName,
        condition: listing.condition,
        city: listing.city,
        district: listing.district,
        province: listing.province,
        location: listing.location,
    });

    // 3. Generate new embedding
    const embedding = await getEmbedding(text);

    // 4. Save it
    const { error: updateError } = await supabase
        .from('listings')
        .update({ embedding })
        .eq('id', listingId);

    if (updateError) {
        console.error('Failed to update embedding:', updateError);
    } else {
        console.log(`Embedding updated for listing ${listingId}`);
    }
}