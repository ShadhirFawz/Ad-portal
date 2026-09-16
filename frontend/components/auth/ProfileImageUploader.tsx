import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Camera,
  Trash2,
  AlertCircle,
  Loader2,
  User,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";

export interface ProfileImageUploaderProps {
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const processFile = async (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const msg = "Only JPEG, PNG and WebP images are supported.";
      setError(msg);
      onError?.(msg);
      return;
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      const msg = "Image file must be 5 MB or smaller.";
      setError(msg);
      onError?.(msg);
      return;
    }

    setIsUploading(true);

    // Create immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const uploadedUrl = await onUpload(file);
      setPreviewUrl(uploadedUrl || objectUrl);
      onSuccess?.(uploadedUrl || objectUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image.";
      setError(message);
      onError?.(message);
      // Revert preview on failure
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading && !isDeleting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading || isDeleting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    if (!isBusy) {
      fileInputRef.current?.click();
    }
  };

  const isBusy = isUploading || isDeleting || disabled;

  return (
    <div className="space-y-3 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isBusy}
        className="hidden"
        aria-label={`Upload ${type === "avatar" ? "avatar" : "cover photo"}`}
      />

      {type === "avatar" ? (
        /* Avatar Upload component */
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
          {/* Avatar Preview Box */}
          <div
            onClick={triggerFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-center shrink-0 shadow-md ${isDragging
              ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-105"
              : "border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500"
              }`}
          >
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800">
                <Image
                  src={previewUrl}
                  alt="Profile Avatar"
                  width={128}
                  height={128}
                  unoptimized
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-1.5 p-2 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  No Avatar
                </span>
              </div>
            )}

            {/* Hover overlay with camera icon */}
            {!isBusy && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[10px] font-semibold tracking-wide">
                  {previewUrl ? "Change" : "Upload"}
                </span>
              </div>
            )}

            {/* Uploading / Deleting overlay spinner */}
            {isBusy && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1.5 z-10">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-[10px] font-medium text-slate-200">
                  {isDeleting ? "Removing..." : "Uploading..."}
                </span>
              </div>
            )}
          </div>

          {/* Avatar Details & Action Buttons */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Profile Avatar
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a clear picture of yourself or your brand.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                JPEG, PNG or WebP • Max 5 MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={isBusy}
                className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>{previewUrl ? "Change Picture" : "Upload Picture"}</span>
                  </>
                )}
              </button>

              {previewUrl && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Removing..." : "Remove"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Cover Photo Upload component */
        <div className="space-y-3">
          {previewUrl ? (
            /* Uploaded Cover Banner View with Actions */
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
              <div className="h-36 sm:h-48 w-full relative">
                <Image
                  src={previewUrl}
                  alt="Cover Photo Preview"
                  width={900}
                  height={240}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Cover Banner Hover / Overlay Bar */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 sm:p-4">
                <span className="text-xs font-semibold text-white/90 drop-shadow-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Cover Photo</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={isBusy}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>

                  {onDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isBusy}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Uploading / Deleting overlay spinner */}
              {isBusy && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-10">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                  <span className="text-xs font-medium text-slate-200">
                    {isDeleting ? "Removing cover photo..." : "Uploading cover photo..."}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Empty State Cover Dropzone */
            <div
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer select-none overflow-hidden ${isDragging
                ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/20"
                : "border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10"
                }`}
            >
              <div className="flex flex-col items-center justify-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to upload or drag &amp; drop cover photo
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    JPEG, PNG or WebP • Max 5 MB • Recommended ratio 3:1 (e.g. 1200×400)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileSelect();
                  }}
                  disabled={isBusy}
                  className="mt-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Browse File</span>
                </button>
              </div>

              {/* Uploading overlay spinner */}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-10">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  <span className="text-xs font-medium text-slate-200">
                    Uploading cover photo...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileImageUploader;
