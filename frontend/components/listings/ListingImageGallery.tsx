"use client";

import { useState } from "react";
import type { ListingImage } from "@/types/listing-image";

interface Props {
    images: ListingImage[];
    title: string;
}

export default function ListingImageGallery({
    images = [],
    title,
}: Props) {

    const safeImages = images ?? [];
    const orderedImages =
        [...safeImages].sort(
            (a, b) =>
                a.displayOrder -
                b.displayOrder
        );

    const [selectedIndex, setSelectedIndex] =
        useState(0);

    if (orderedImages.length === 0) {

        return (
            <div
                className="
          flex
          aspect-square
          items-center
          justify-center
          rounded-lg
          border
        "
            >
                <span className="text-sm">
                    No images available
                </span>
            </div>
        );
    }

    const selectedImage =
        orderedImages[
        Math.min(
            selectedIndex,
            orderedImages.length - 1
        )
        ];

    return (
        <div className="space-y-3">

            <div
                className="
          overflow-hidden
          rounded-lg
          border
        "
            >
                <img
                    src={selectedImage.url}
                    alt={
                        selectedImage.fileName ??
                        title
                    }
                    className="
            aspect-square
            w-full
            object-cover
          "
                />
            </div>

            {orderedImages.length > 1 && (

                <div
                    className="
            grid
            grid-cols-4
            gap-2
            sm:grid-cols-5
          "
                >

                    {orderedImages.map(
                        (image, index) => (

                            <button
                                key={image.id}
                                type="button"
                                onClick={() =>
                                    setSelectedIndex(index)
                                }
                                className={`
                  overflow-hidden
                  rounded
                  border
                  ${selectedIndex === index
                                        ? "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 dark:ring-offset-slate-900"
                                        : "opacity-75 hover:opacity-100 border-slate-200 dark:border-slate-800"
                                    }
                `}
                            >

                                <img
                                    src={image.url}
                                    alt=""
                                    className="
                    aspect-square
                    w-full
                    object-cover
                  "
                                />

                            </button>
                        )
                    )}

                </div>
            )}

        </div>
    );
}