import { createClient } from "@/lib/supabase/client";
import type {
  ProfileImageType,
  ProfileImageResponse,
  RegisterProfileImagePayload,
} from "@/types/profile-image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

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

/**
 * 1. Uploads file directly to Supabase Storage bucket
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
  type: ProfileImageType
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
    console.error("Profile image storage upload failed:", error);
    throw new Error(error.message);
  }

  return data.path;
}

/**
 * 2. Registers the uploaded image with the backend API
 */
export async function registerProfileImage(
  accessToken: string,
  type: ProfileImageType,
  payload: RegisterProfileImagePayload
): Promise<ProfileImageResponse> {
  const response = await fetch(`${API_URL}/users/me/images/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to register profile image.";
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

/**
 * 3. Retrieves current image info from backend API
 */
export async function getProfileImage(
  accessToken: string,
  type: ProfileImageType
): Promise<ProfileImageResponse> {
  const response = await fetch(`${API_URL}/users/me/images/${type}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = "Failed to fetch profile image.";
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

/**
 * 4. Deletes the profile image via backend API (cleans up DB & storage)
 */
export async function deleteProfileImage(
  accessToken: string,
  type: ProfileImageType
): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/images/${type}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = "Failed to delete profile image.";
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

/**
 * Helper to get public URL directly from Supabase
 */
export function getProfileImageUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
