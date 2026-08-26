"use client";

import { useState } from "react";
import type { ListingImage } from "@/types/listing-image";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import ListingImageLightbox from "@/components/listings/ListingImageLightbox";

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
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (orderedImages.length === 0) {
        return (
            <div className="flex aspect-square w-full max-w-100 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
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
        <>
            <div className="space-y-3 max-w-100">
                {/* Main Hero Image */}
                <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-zoom-in shadow-sm hover:shadow-md transition-all duration-300"
                    title="Click to enlarge photo gallery"
                >
                    <Image
                        src={selectedImage.url}
                        alt={selectedImage.fileName ?? title}
                        width={600}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Enlarge Gallery</span>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Grid */}
                {orderedImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {orderedImages.map((image, index) => (
                            <button
                                key={image.id || index}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className={`
                                    relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200
                                    ${
                                        selectedIndex === index
                                            ? "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 dark:ring-offset-slate-900 scale-95"
                                            : "opacity-75 hover:opacity-100 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                                    }
                                `}
                                aria-label={`Select photo ${index + 1}`}
                            >
                                <Image
                                    src={image.url}
                                    alt=""
                                    width={120}
                                    height={120}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Popup Fullscreen Lightbox Modal */}
            <ListingImageLightbox
                isOpen={isLightboxOpen}
                images={orderedImages}
                initialIndex={selectedIndex}
                title={title}
                onClose={() => setIsLightboxOpen(false)}
            />
        </>
    );
}