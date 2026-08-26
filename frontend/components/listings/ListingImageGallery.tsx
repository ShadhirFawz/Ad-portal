"use client";

import { useState } from "react";
import type { ListingImage } from "@/types/listing-image";
import Image from "next/image";

interface Props {
    images: ListingImage[];
    title: string;
}

export default function ListingImageGallery({ images = [], title }: Props) {
    const safeImages = images ?? [];
    const orderedImages = [...safeImages].sort(
        (a, b) => a.displayOrder - b.displayOrder
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    if (orderedImages.length === 0) {
        return (
            <div className="flex aspect-square w-full max-w-100 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    No images available
                </span>
            </div>
        );
    }

    const selectedImage = orderedImages[
        Math.min(selectedIndex, orderedImages.length - 1)
    ];

    return (
        <div className="space-y-3 max-w-100">
            {/* Main Image */}
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Image
                    src={selectedImage.url}
                    alt={selectedImage.fileName ?? title}
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                    priority
                />
            </div>

            {/* Thumbnail Grid */}
            {orderedImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {orderedImages.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className={`
                                overflow-hidden rounded border transition-all duration-200
                                ${
                                    selectedIndex === index
                                        ? "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 dark:ring-offset-slate-900"
                                        : "opacity-75 hover:opacity-100 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                                }
                            `}
                        >
                            <Image
                                src={image.url}
                                alt=""
                                width={80}
                                height={80}
                                className="aspect-square w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}