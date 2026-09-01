"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ListingImage } from "@/types/listing-image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface ListingImageLightboxProps {
  isOpen: boolean;
  images: ListingImage[];
  initialIndex?: number;
  title: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function ListingImageLightbox({
  isOpen,
  images = [],
  initialIndex = 0,
  title,
  onClose,
}: ListingImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialIndex when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      resetZoomAndPan();
    }
  }, [isOpen, initialIndex, images.length]);

  const resetZoomAndPan = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoomAndPan();
  }, [images.length, resetZoomAndPan]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoomAndPan();
  }, [images.length, resetZoomAndPan]);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetZoomAndPan();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handleNext, handlePrev, resetZoomAndPan]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const nextZoom = Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(1)));
      if (nextZoom === MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    panStartRef.current = { ...pan };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double click toggles 1x and 2x zoom
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoomAndPan();
    }
  };

  if (!isOpen || images.length === 0 || !mounted) return null;

  const currentImage = images[currentIndex] || images[0];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar: Title and Counter only */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white tracking-wider backdrop-blur-md">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-300 truncate max-w-[200px] sm:max-w-md hidden sm:inline-block">
            {title}
          </span>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-2"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow - Prev */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-150 border border-white/10 backdrop-blur-md shadow-2xl"
            title="Previous Image (Left Arrow)"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Zoom Controls + Close Button Group */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-xl shadow-2xl">
          {/* Close Button - Now at the top of the zoom controls */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-150"
            title="Close (Esc)"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-6 h-px bg-white/20 my-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={zoom <= MIN_ZOOM}
            className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all active:scale-95"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={zoom >= MAX_ZOOM}
            className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all active:scale-95"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {zoom > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoomAndPan();
              }}
              className="mt-0.5 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{Math.round(zoom * 100)}%</span>
            </button>
          )}
        </div>

        {/* Scalable & Pannable Image Container */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100 ease-out ${zoom > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
            }`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
          onDoubleClick={handleDoubleClick}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.fileName ?? title}
            width={1200}
            height={900}
            unoptimized
            priority
            className="max-h-[68vh] sm:max-h-[72vh] w-auto max-w-[92vw] object-contain rounded-lg shadow-2xl pointer-events-none"
          />
        </div>

        {/* Navigation Arrow - Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-150 border border-white/10 backdrop-blur-md shadow-2xl"
            title="Next Image (Right Arrow)"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Filmstrip: Horizontal Scrolling Thumbnail Grid */}
      <div className="relative z-30 px-4 py-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-2 no-scrollbar max-w-4xl mx-auto">
          {images.map((img, index) => {
            const isSelected = index === currentIndex;

            return (
              <button
                key={img.id || index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  resetZoomAndPan();
                }}
                className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${isSelected
                    ? "border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40"
                    : "border-white/20 opacity-50 hover:opacity-100 hover:border-white/60"
                  }`}
                aria-label={`View photo ${index + 1}`}
              >
                <Image
                  src={img.url}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}