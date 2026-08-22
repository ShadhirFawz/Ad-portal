"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
    uploadListingImage,
    registerListingImage,
    deleteListingImage,
    setPrimaryListingImage,
    reorderListingImages,
    getListingImages,
    validateFile,
} from "@/services/listing-image-service";
import type { ListingImage } from "@/types/listing-image";

const MAX_IMAGES = 10;

interface ListingImageUploaderProps {
    listingId: string;
    initialImages?: ListingImage[];
    onChange?: (images: ListingImage[]) => void;
}

interface UploadingImage {
    id: string;
    file: File;
    previewUrl: string;
    progress: number;
    error?: string;
}

export default function ListingImageUploader({
    listingId,
    initialImages = [],
    onChange,
}: ListingImageUploaderProps) {
    const { accessToken } = useAuth();

    const [images, setImages] = useState<ListingImage[]>(initialImages);
    const [uploading, setUploading] = useState<UploadingImage[]>([]);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            uploading.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [uploading]);

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

            updateImages([...images, registeredImage]);

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

        const remainingSlots = MAX_IMAGES - images.length - uploading.length;
        if (remainingSlots <= 0) return;

        const selectedFiles = Array.from(files).slice(0, remainingSlots);
        for (const file of selectedFiles) {
            await uploadFile(file);
        }
    }

    async function deleteImage(image: ListingImage) {
        if (!accessToken) return;

        await deleteListingImage(accessToken, listingId, image.id);

        updateImages(
            images
                .filter((item) => item.id !== image.id)
                .map((item, index) => ({
                    ...item,
                    displayOrder: index,
                }))
        );
    }

    async function setPrimary(image: ListingImage) {
        if (!accessToken) return;

        await setPrimaryListingImage(accessToken, listingId, image.id);

        const nextImages = images.map((item) => ({
            ...item,
            primary: item.id === image.id,
        }));

        updateImages(nextImages);
    }

    async function persistOrder(reorderedImages: ListingImage[]) {
        if (!accessToken) return;

        try {
            await reorderListingImages(
                accessToken,
                listingId,
                reorderedImages.map((image) => image.id)
            );
        } catch (error) {
            console.error("Failed to persist image order:", error);
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
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
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
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                        📷
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={images.length + uploading.length >= MAX_IMAGES}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition"
                        >
                            Select Photos
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        JPEG, PNG or WebP • Max 6 MB each • Up to {MAX_IMAGES} photos
                    </p>
                </div>
            </div>

            {uploading.length > 0 && (
                <div className="space-y-3">
                    {uploading.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                        >
                            <img
                                src={item.previewUrl}
                                alt=""
                                className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex-1 space-y-1.5">
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
                                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                        {item.error}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length > 0 && (
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
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing"
                        >
                            <div className="relative aspect-square w-full">
                                <img
                                    src={image.url}
                                    alt={image.fileName ?? "Listing photo"}
                                    className="h-full w-full object-cover"
                                />
                                {image.primary && (
                                    <span className="absolute left-2.5 top-2.5 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm uppercase tracking-wider">
                                        Cover Photo
                                    </span>
                                )}
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={image.displayOrder === 0}
                                        onClick={() => moveImageByOffset(image.id, -1)}
                                        className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        title="Move Left"
                                    >
                                        ←
                                    </button>
                                    <button
                                        type="button"
                                        disabled={image.displayOrder === images.length - 1}
                                        onClick={() => moveImageByOffset(image.id, 1)}
                                        className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        title="Move Right"
                                    >
                                        →
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {!image.primary && (
                                        <button
                                            type="button"
                                            onClick={() => setPrimary(image)}
                                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                        >
                                            Set Primary
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => deleteImage(image)}
                                        className="h-7 w-7 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition"
                                        title="Delete photo"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}