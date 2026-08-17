import { createClient } from "@/lib/supabase/client";
import { ListingImage } from "@/types/listing-image";

const BUCKET = "listing-images";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE =
    6 * 1024 * 1024;

function getExtension(file: File): string {

    switch (file.type) {
        case "image/jpeg":
            return "jpg";

        case "image/png":
            return "png";

        case "image/webp":
            return "webp";

        default:
            throw new Error(
                "Unsupported image type."
            );
    }
}

function validateFile(file: File) {

    if (!ALLOWED_TYPES.includes(file.type)) {

        throw new Error(
            "Only JPEG, PNG and WebP images are supported."
        );
    }

    if (file.size > MAX_FILE_SIZE) {

        throw new Error(
            "Image must be 6 MB or smaller."
        );
    }
}

export async function uploadListingImage(
    listingId: string,
    file: File
): Promise<string> {

    validateFile(file);

    const supabase =
        createClient();

    const extension =
        getExtension(file);

    const imageId =
        crypto.randomUUID();

    const path =
        `listings/${listingId}/${imageId}.${extension}`;

    const {
        data,
        error
    } = await supabase.storage
        .from(BUCKET)
        .upload(
            path,
            file,
            {
                contentType: file.type,
                cacheControl: "31536000",
                upsert: false,
            }
        );

    if (error) {

        console.error(
            "Listing image upload failed:",
            error
        );

        throw new Error(
            error.message
        );
    }

    return data.path;
}

export async function registerListingImage(
    listingId: string,
    payload: {
        storagePath: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        width?: number;
        height?: number;
    }
): Promise<ListingImage> {

    const response =
        await fetch(
            `/api/v1/listings/${listingId}/images`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    payload
                ),
            }
        );

    if (!response.ok) {

        throw new Error(
            "Failed to register listing image."
        );
    }

    return response.json();
}