import React, { useState, useEffect, useRef } from "react";
import { Upload, AlertTriangle, Loader } from "lucide-react";

interface ProfileImageUploaderProps {
  type: "avatar" | "cover";
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function ProfileImageUploader({
  type,
  currentImageUrl,
  onUpload,
  onDelete,
  onSuccess,
  onError,
  disabled = false,
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG and WebP images are supported.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must be 5 MB or smaller.");
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const uploadedUrl = await onUpload(file);
      onSuccess?.(uploadedUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image.";
      setError(message);
      onError?.(message);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setError(null);
    setIsDeleting(true);

    try {
      await onDelete();
      setPreviewUrl(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove image.";
      setError(message);
      onError?.(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const isBusy = isUploading || isDeleting || disabled;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isBusy}
        className="hidden"
        aria-label={`Upload ${type}`}
      />

      {type === "avatar" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl">👤</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isBusy}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{previewUrl ? "Change Avatar" : "Upload Avatar"}</span>
                </>
              )}
            </button>

            {previewUrl && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-32 sm:h-40 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-2xl mb-1">🖼️</div>
                <p className="text-xs text-slate-500">No cover photo</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isBusy}
              className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{previewUrl ? "Change Cover Photo" : "Upload Cover Photo"}</span>
                </>
              )}
            </button>

            {previewUrl && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isBusy}
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
