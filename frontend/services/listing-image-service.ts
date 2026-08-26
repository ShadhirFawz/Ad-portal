import { createClient } from "@/lib/supabase/client";
import { ListingImage } from "@/types/listing-image";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const BUCKET = "listing-images";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE = 6 * 1024 * 1024;

export function getExtension(file: File): string {
    switch (file.type) {
        case "image/jpeg":
            return "jpg";
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        default:
            throw new Error("Unsupported image type.");
    }
}

export function validateFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Only JPEG, PNG and WebP images are supported.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Image must be 6 MB or smaller.");
    }
}

export async function uploadListingImage(
    listingId: string,
    file: File
): Promise<string> {
    validateFile(file);

    const supabase = createClient();
    const extension = getExtension(file);
    const imageId = crypto.randomUUID();
    const path = `listings/${listingId}/${imageId}.${extension}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type,
            cacheControl: "31536000",
            upsert: false,
        });

    if (error) {
        console.error("Listing image upload failed:", error);
        throw new Error(error.message);
    }

    return data.path;
}

export async function registerListingImage(
    accessToken: string,
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
    const response = await fetch(`${API_URL}/listings/${listingId}/images`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let message = "Failed to register listing image.";
        try {
            const body = await response.json();
            message = body?.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return response.json();
}

export async function addListingImageFromUrl(
    accessToken: string,
    listingId: string,
    imageUrl: string
): Promise<ListingImage> {
    const trimmedUrl = imageUrl.trim();
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    let fileName = "external-image";
    try {
        const parsed = new URL(trimmedUrl);
        const segment = parsed.pathname.substring(parsed.pathname.lastIndexOf("/") + 1);
        if (segment && segment.includes(".")) {
            fileName = segment.split("?")[0];
        }
    } catch {
        // default fileName
    }

    return registerListingImage(accessToken, listingId, {
        storagePath: trimmedUrl,
        fileName,
        mimeType: "image/jpeg",
        fileSize: 0,
    });
}

export async function getListingImages(
    listingId: string
): Promise<ListingImage[]> {
    const response = await fetch(`${API_URL}/listings/${listingId}/images`);

    if (!response.ok) {
        let message = "Failed to fetch listing images.";
        try {
            const body = await response.json();
            message = body?.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return response.json();
}

export async function deleteListingImage(
    accessToken: string,
    listingId: string,
    imageId: string
): Promise<void> {
    const response = await fetch(
        `${API_URL}/listings/${listingId}/images/${imageId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        let message = "Failed to delete image.";
        try {
            const body = await response.json();
            message = body?.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }
}

export async function setPrimaryListingImage(
    accessToken: string,
    listingId: string,
    imageId: string
): Promise<ListingImage> {
    const response = await fetch(
        `${API_URL}/listings/${listingId}/images/${imageId}/primary`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        let message = "Failed to set primary image.";
        try {
            const body = await response.json();
            message = body?.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return response.json();
}

export async function reorderListingImages(
    accessToken: string,
    listingId: string,
    imageIds: string[]
): Promise<void> {
    const response = await fetch(
        `${API_URL}/listings/${listingId}/images/order`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                imageIds,
            }),
        }
    );

    if (!response.ok) {
        let message = "Failed to reorder listing images.";
        try {
            const body = await response.json();
            message = body?.message || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }
}