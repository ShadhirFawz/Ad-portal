"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
    deleteListingImage,
    getListingImages,
    registerListingImage,
    reorderListingImages,
    setPrimaryListingImage,
    uploadListingImage,
    validateFile,
} from "@/services/listing-image-service";
import { ListingImage } from "@/types/listing-image";
import {
    Camera,
    UploadCloud,
    Trash2,
    Star,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    AlertCircle,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

interface UploadingState {
    id: string;
    file: File;
    previewUrl: string;
    progress: number;
    error?: string;
}

interface Props {
    listingId: string;
    initialImages?: ListingImage[];
    onChange?: (images: ListingImage[]) => void;
}

const MAX_IMAGES = 10;

export default function ListingImageUploader({
    listingId,
    initialImages = [],
    onChange,
}: Props) {
    const { accessToken } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);

    const [images, setImages] = useState<ListingImage[]>(initialImages);
    const [uploading, setUploading] = useState<UploadingState[]>([]);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
    const [reorderError, setReorderError] = useState<string | null>(null);

    function updateImages(nextImages: ListingImage[]) {
        setImages(nextImages);
        onChange?.(nextImages);
    }

    async function getImageDimensions(
        file: File
    ): Promise<{ width: number; height: number }> {
        const url = URL.createObjectURL(file);
        try {
            return await new Promise<{ width: number; height: number }>(
                (resolve, reject) => {
                    const image = new Image();
                    image.onload = () => {
                        resolve({
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                        });
                    };
                    image.onerror = () => {
                        reject(new Error("Unable to read image."));
                    };
                    image.src = url;
                }
            );
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    async function uploadFile(file: File) {
        try {
            validateFile(file);
        } catch (validationErr) {
            throw validationErr;
        }

        if (!accessToken) {
            throw new Error("You must be logged in to upload images.");
        }

        const uploadId = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        setUploading((prev) => [
            ...prev,
            {
                id: uploadId,
                file,
                previewUrl,
                progress: 20,
            },
        ]);

        try {
            // 1. Upload file directly to Supabase Storage bucket
            const storagePath = await uploadListingImage(listingId, file);

            setUploading((prev) =>
                prev.map((item) =>
                    item.id === uploadId ? { ...item, progress: 70 } : item
                )
            );

            // 2. Read dimensions
            const dimensions = await getImageDimensions(file);

            // 3. Register image metadata with backend
            const registeredImage = await registerListingImage(
                accessToken,
                listingId,
                {
                    storagePath,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                    width: dimensions.width,
                    height: dimensions.height,
                }
            );

            setUploading((prev) =>
                prev.map((item) =>
                    item.id === uploadId ? { ...item, progress: 100 } : item
                )
            );

            setImages((current) => {
                const next = [...current, registeredImage];
                onChange?.(next);
                return next;
            });

            setUploading((prev) => prev.filter((item) => item.id !== uploadId));
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Image upload failed.";

            setUploading((prev) =>
                prev.map((item) =>
                    item.id === uploadId
                        ? { ...item, progress: 0, error: message }
                        : item
                )
            );
        }
    }

    async function handleFiles(files: FileList | null) {
        if (!files) return;

        const currentCount = images.length + uploading.length;
        const availableSlots = MAX_IMAGES - currentCount;

        if (availableSlots <= 0) {
            alert(`You can only upload up to ${MAX_IMAGES} images.`);
            return;
        }

        const selectedFiles = Array.from(files).slice(0, availableSlots);

        for (const file of selectedFiles) {
            await uploadFile(file);
        }
    }

    async function deleteImage(image: ListingImage) {
        if (!accessToken) return;

        await deleteListingImage(accessToken, listingId, image.id);

        setImages((current) => {
            const next = current
                .filter((item) => item.id !== image.id)
                .map((item, index) => ({
                    ...item,
                    displayOrder: index,
                }));
            onChange?.(next);
            return next;
        });
    }

    async function setPrimary(image: ListingImage) {
        if (!accessToken) return;

        await setPrimaryListingImage(accessToken, listingId, image.id);

        setImages((current) => {
            const next = current.map((item) => ({
                ...item,
                primary: item.id === image.id,
            }));
            onChange?.(next);
            return next;
        });
    }

    async function persistOrder(reorderedImages: ListingImage[]) {
        if (!accessToken) return;
        setReorderError(null);

        try {
            await reorderListingImages(
                accessToken,
                listingId,
                reorderedImages.map((image) => image.id)
            );
        } catch (error) {
            console.error("Failed to persist image order:", error);
            setReorderError(
                error instanceof Error ? error.message : "Failed to reorder images on server."
            );
            try {
                const serverImages = await getListingImages(listingId);
                updateImages(serverImages);
            } catch {
                // ignore reload error
            }
        }
    }

    function moveImage(sourceId: string, targetId: string) {
        if (sourceId === targetId) return;

        const currentImages = [...images];
        const sourceIndex = currentImages.findIndex((img) => img.id === sourceId);
        const targetIndex = currentImages.findIndex((img) => img.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const [movedImage] = currentImages.splice(sourceIndex, 1);
        currentImages.splice(targetIndex, 0, movedImage);

        const reordered = currentImages.map((image, index) => ({
            ...image,
            displayOrder: index,
        }));

        updateImages(reordered);
        void persistOrder(reordered);
    }

    function moveImageByOffset(imageId: string, offset: number) {
        const currentImages = [...images];
        const currentIndex = currentImages.findIndex((img) => img.id === imageId);
        const targetIndex = currentIndex + offset;

        if (
            currentIndex === -1 ||
            targetIndex < 0 ||
            targetIndex >= currentImages.length
        ) {
            return;
        }

        const [moved] = currentImages.splice(currentIndex, 1);
        currentImages.splice(targetIndex, 0, moved);

        const reordered = currentImages.map((image, index) => ({
            ...image,
            displayOrder: index,
        }));

        updateImages(reordered);
        void persistOrder(reordered);
    }

    return (
        <div className="space-y-6">
            {reorderError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{reorderError}</span>
                    </div>
                    <button
                        onClick={() => setReorderError(null)}
                        className="text-xs hover:underline font-semibold"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                className="group rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 p-8 text-center bg-slate-50/60 dark:bg-slate-900/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all cursor-pointer select-none"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        handleFiles(event.target.files);
                        event.target.value = "";
                    }}
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Click to upload or drag &amp; drop photos
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPEG, PNG or WebP • Max 6 MB each • Up to {MAX_IMAGES} photos
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        disabled={images.length + uploading.length >= MAX_IMAGES}
                        className="mt-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Browse Files</span>
                    </button>
                </div>
            </div>

            {/* In-Flight Uploading Cards */}
            {uploading.length > 0 && (
                <div className="space-y-3">
                    {uploading.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm"
                        >
                            <img
                                src={item.previewUrl}
                                alt=""
                                className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                                    <span className="truncate max-w-[200px]">{item.file.name}</span>
                                    <span>{item.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                                {item.error && (
                                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{item.error}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Gallery Grid with Drag Reordering */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                        <span>Uploaded Photos ({images.length}/{MAX_IMAGES})</span>
                        <span className="text-[11px] font-normal">Drag to reorder • First photo is primary cover</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                draggable
                                onDragStart={() => setDraggedImageId(image.id)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                    if (draggedImageId) {
                                        moveImage(draggedImageId, image.id);
                                    }
                                    setDraggedImageId(null);
                                }}
                                onDragEnd={() => setDraggedImageId(null)}
                                className={`group relative overflow-hidden rounded-2xl border bg-slate-100 dark:bg-slate-900 shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing ${
                                    image.primary
                                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                        : "border-slate-200/80 dark:border-slate-800"
                                }`}
                            >
                                <div className="relative aspect-square w-full">
                                    <img
                                        src={image.url}
                                        alt={image.fileName ?? "Listing photo"}
                                        className="h-full w-full object-cover"
                                    />
                                    {image.primary && (
                                        <span className="absolute left-2.5 top-2.5 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm uppercase tracking-wider flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-white" />
                                            <span>Cover Photo</span>
                                        </span>
                                    )}
                                </div>

                                <div className="p-2.5 bg-white dark:bg-slate-900/95 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={image.displayOrder === 0}
                                            onClick={() => moveImageByOffset(image.id, -1)}
                                            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            title="Move Left"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={image.displayOrder === images.length - 1}
                                            onClick={() => moveImageByOffset(image.id, 1)}
                                            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            title="Move Right"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {!image.primary && (
                                            <button
                                                type="button"
                                                onClick={() => setPrimary(image)}
                                                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                                            >
                                                <Star className="w-3 h-3" />
                                                <span>Primary</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(image)}
                                            className="h-7 w-7 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition"
                                            title="Delete photo"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}