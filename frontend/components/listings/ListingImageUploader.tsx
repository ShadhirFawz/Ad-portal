"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ListingImage } from "@/types/listing-image";

const BUCKET = "listing-images";

const MAX_IMAGES = 10;

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

interface ListingImageUploaderProps {

    listingId: string;

    initialImages?: ListingImage[];

    onChange?: (
        images: ListingImage[]
    ) => void;
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

    const [images, setImages] =
        useState<ListingImage[]>(
            initialImages
        );

    const [uploading, setUploading] =
        useState<UploadingImage[]>([]);

    const inputRef =
        useRef<HTMLInputElement>(null);

    const supabase =
        createClient();

    useEffect(() => {

        return () => {

            uploading.forEach(
                item =>
                    URL.revokeObjectURL(
                        item.previewUrl
                    )
            );
        };

    }, [uploading]);

    function updateImages(
        nextImages: ListingImage[]
    ) {

        setImages(nextImages);

        onChange?.(nextImages);
    }

    function validateFile(
        file: File
    ): string | null {

        if (!ALLOWED_TYPES.has(file.type)) {

            return (
                "Only JPEG, PNG and WebP images are supported."
            );
        }

        if (file.size > MAX_FILE_SIZE) {

            return (
                "Image must be 6 MB or smaller."
            );
        }

        return null;
    }

    async function getImageDimensions(
        file: File
    ): Promise<{
        width: number;
        height: number;
    }> {

        const url =
            URL.createObjectURL(file);

        try {

            const dimensions =
                await new Promise<{
                    width: number;
                    height: number;
                }>((resolve, reject) => {

                    const image =
                        new Image();

                    image.onload = () => {

                        resolve({
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                        });
                    };

                    image.onerror = () => {

                        reject(
                            new Error(
                                "Unable to read image."
                            )
                        );
                    };

                    image.src = url;
                });

            return dimensions;

        } finally {

            URL.revokeObjectURL(url);
        }
    }

    async function uploadFile(
        file: File
    ) {

        const validationError =
            validateFile(file);

        if (validationError) {

            throw new Error(
                validationError
            );
        }

        const uploadId =
            crypto.randomUUID();

        const previewUrl =
            URL.createObjectURL(file);

        setUploading(previous => [
            ...previous,
            {
                id: uploadId,
                file,
                previewUrl,
                progress: 0,
            },
        ]);

        let storagePath: string | null =
            null;

        try {

            const extension =
                getExtension(file);

            storagePath =
                `listings/${listingId}/${uploadId}.${extension}`;

            setUploading(previous =>
                previous.map(item =>
                    item.id === uploadId
                        ? {
                            ...item,
                            progress: 20,
                        }
                        : item
                )
            );

            const {
                data,
                error,
            } = await supabase.storage
                .from(BUCKET)
                .upload(
                    storagePath,
                    file,
                    {
                        contentType:
                            file.type,

                        cacheControl:
                            "31536000",

                        upsert:
                            false,
                    }
                );

            if (error) {

                throw new Error(
                    error.message
                );
            }

            setUploading(previous =>
                previous.map(item =>
                    item.id === uploadId
                        ? {
                            ...item,
                            progress: 60,
                        }
                        : item
                )
            );

            const dimensions =
                await getImageDimensions(
                    file
                );

            const response =
                await fetch(
                    `/api/v1/listings/${listingId}/images`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            storagePath:
                                data.path,

                            fileName:
                                file.name,

                            mimeType:
                                file.type,

                            fileSize:
                                file.size,

                            width:
                                dimensions.width,

                            height:
                                dimensions.height,

                            metadata: {},
                        }),
                    }
                );

            if (!response.ok) {

                const message =
                    await response.text();

                throw new Error(
                    message ||
                    "Failed to register listing image."
                );
            }

            const registeredImage:
                ListingImage =
                await response.json();

            updateImages([
                ...images,
                registeredImage,
            ]);

            setUploading(previous =>
                previous.filter(
                    item =>
                        item.id !== uploadId
                )
            );

        } catch (error) {

            if (storagePath) {

                await supabase.storage
                    .from(BUCKET)
                    .remove([
                        storagePath,
                    ])
                    .catch(() => {
                        // Cleanup failure will be handled
                        // by the orphan-storage cleanup process.
                    });
            }

            const message =
                error instanceof Error
                    ? error.message
                    : "Image upload failed.";

            setUploading(previous =>
                previous.map(item =>
                    item.id === uploadId
                        ? {
                            ...item,
                            progress: 0,
                            error: message,
                        }
                        : item
                )
            );
        }
    }

    async function handleFiles(
        files: FileList | null
    ) {

        if (!files) {
            return;
        }

        const remainingSlots =
            MAX_IMAGES
            - images.length
            - uploading.length;

        if (remainingSlots <= 0) {

            return;
        }

        const selectedFiles =
            Array.from(files)
                .slice(
                    0,
                    remainingSlots
                );

        for (const file of selectedFiles) {

            await uploadFile(file);
        }
    }

    async function deleteImage(
        image: ListingImage
    ) {

        const response =
            await fetch(
                `/api/v1/listings/${listingId}/images/${image.id}`,
                {
                    method: "DELETE",
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to delete image."
            );
        }

        updateImages(
            images
                .filter(
                    item =>
                        item.id !== image.id
                )
                .map(
                    (item, index) => ({
                        ...item,
                        displayOrder: index,
                    })
                )
        );
    }

    async function setPrimary(
        image: ListingImage
    ) {

        const response =
            await fetch(
                `/api/v1/listings/${listingId}/images/${image.id}/primary`,
                {
                    method: "POST",
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to set primary image."
            );
        }

        const nextImages =
            images.map(item => ({
                ...item,
                primary:
                    item.id === image.id,
            }));

        updateImages(nextImages);
    }

    return (
        <div className="space-y-6">

            <div
                className="
          rounded-lg
          border-2
          border-dashed
          p-6
          text-center
        "
            >

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={event => {

                        handleFiles(
                            event.target.files
                        );

                        event.target.value = "";
                    }}
                />

                <button
                    type="button"
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    disabled={
                        images.length
                        + uploading.length
                        >= MAX_IMAGES
                    }
                    className="
            rounded-md
            border
            px-4
            py-2
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                >
                    Add photos
                </button>

                <p className="mt-2 text-sm">
                    JPEG, PNG or WebP ·
                    Maximum 6 MB each ·
                    Maximum {MAX_IMAGES} images
                </p>

            </div>

            {uploading.length > 0 && (

                <div className="space-y-3">

                    {uploading.map(item => (

                        <div
                            key={item.id}
                            className="
                flex
                items-center
                gap-3
                rounded-md
                border
                p-3
              "
                        >

                            <img
                                src={item.previewUrl}
                                alt=""
                                className="
                  h-16
                  w-16
                  rounded
                  object-cover
                "
                            />

                            <div className="flex-1">

                                <p className="text-sm">
                                    {item.file.name}
                                </p>

                                <progress
                                    value={item.progress}
                                    max={100}
                                    className="w-full"
                                />

                                {item.error && (

                                    <p className="text-sm text-red-600">
                                        {item.error}
                                    </p>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            )}

            {images.length > 0 && (

                <div
                    className="
            grid
            grid-cols-2
            gap-4
            sm:grid-cols-3
            lg:grid-cols-4
          "
                >

                    {images.map(image => (

                        <div
                            key={image.id}
                            className="
                overflow-hidden
                rounded-lg
                border
              "
                        >

                            <div className="relative">

                                <img
                                    src={image.url}
                                    alt={
                                        image.fileName ??
                                        "Listing image"
                                    }
                                    className="
                    aspect-square
                    w-full
                    object-cover
                  "
                                />

                                {image.primary && (

                                    <span
                                        className="
                      absolute
                      left-2
                      top-2
                      rounded
                      bg-black
                      px-2
                      py-1
                      text-xs
                      text-white
                    "
                                    >
                                        Primary
                                    </span>
                                )}

                            </div>

                            <div className="flex gap-2 p-2">

                                {!image.primary && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPrimary(image)
                                        }
                                        className="
                      flex-1
                      rounded
                      border
                      px-2
                      py-1
                      text-xs
                    "
                                    >
                                        Make primary
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteImage(image)
                                    }
                                    className="
                    rounded
                    border
                    px-2
                    py-1
                    text-xs
                  "
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

function getExtension(
    file: File
): string {

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