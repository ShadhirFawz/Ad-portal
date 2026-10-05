import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@huggingface/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { buildListingEmbeddingText } from '../embeddings';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'frontend/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'frontend/.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = 20;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing environment variables!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'MISSING');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getEmbedding(text: string, extractor: any) {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data) as number[];
}

async function main() {
    console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
    const extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { dtype: 'q8' }
    );
    console.log('Model loaded.\n');

    // Fetch listings
    const { data: listings, error } = await supabase
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
        .is('deleted_at', null);

    if (error) {
        console.error('Error fetching listings:', error);
        return;
    }

    console.log(`Found ${listings?.length || 0} listings to process.\n`);

    for (let i = 0; i < (listings?.length || 0); i += BATCH_SIZE) {
        const batch = listings!.slice(i, i + BATCH_SIZE);

        for (const listing of batch) {
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

            try {
                const embedding = await getEmbedding(text, extractor);

                const { error: updateError } = await supabase
                    .from('listings')
                    .update({ embedding })
                    .eq('id', listing.id);

                if (updateError) {
                    console.error(`Failed to update listing ${listing.id}:`, updateError.message);
                } else {
                    console.log(`✓ Embedded: ${listing.title?.substring(0, 50)}...`);
                }
            } catch (err) {
                console.error(`Error on listing ${listing.id}:`, err);
            }
        }

        console.log(`--- Batch ${Math.floor(i / BATCH_SIZE) + 1} done ---\n`);
    }

    console.log('Embedding update completed successfully!');
}

main();