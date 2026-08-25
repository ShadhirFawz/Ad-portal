import { createClient } from "@/lib/supabase/client";

const BUCKET = "profile-images";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
        throw new Error("Profile image must be 5 MB or smaller.");
    }
}

export async function uploadProfileImage(
    userId: string,
    file: File,
    type: "avatar" | "cover"
): Promise<string> {
    validateFile(file);

    const supabase = createClient();
    const extension = getExtension(file);
    const timestamp = Date.now();
    const path = `users/${userId}/${type}-${timestamp}.${extension}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: true,
        });

    if (error) {
        console.error("Profile image upload failed:", error);
        throw new Error(error.message);
    }

    return data.path;
}

export function getProfileImageUrl(storagePath: string): string {
    const supabase = createClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
}

export async function deleteProfileImage(storagePath: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([storagePath]);

    if (error) {
        console.error("Profile image deletion failed:", error);
        throw new Error(error.message);
    }
}
