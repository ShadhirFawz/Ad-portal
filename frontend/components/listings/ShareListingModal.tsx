"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Mail,
  Smartphone,
  MapPin,
  Tag,
} from "lucide-react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useToast } from "@/hooks/useToast";

export interface ShareListingData {
  id: string | number;
  title: string;
  slug?: string | null;
  price?: number | null;
  currency?: string | null;
  pricingType?: string | null;
  categoryName?: string | null;
  primaryImage?: { url: string } | null;
  images?: Array<{ url: string; primary?: boolean; displayOrder?: number }> | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  condition?: string | null;
}

interface ShareListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ShareListingData | null;
}

export default function ShareListingModal({
  isOpen,
  onClose,
  listing,
}: ShareListingModalProps) {
  const { success: toastSuccess } = useToast();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Check if native Web Share API is available
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && Boolean(navigator.share)) {
      setCanNativeShare(true);
    }
  }, []);

  // Reset copied state on open
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !listing) return null;

  // Resolve listing image
  const primaryImageUrl =
    listing.primaryImage?.url ||
    (listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.primary)?.url || listing.images[0]?.url
      : null);

  // Determine full URL
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/listings/${listing.slug || listing.id}`;

  // Formatted price
  const formatPrice = () => {
    if (listing.pricingType === "FREE") return "Free";
    if (listing.pricingType === "CONTACT_FOR_PRICE") return "Contact for Price";
    const currency = listing.currency ?? "LKR";
    const formattedAmount =
      typeof listing.price === "number"
        ? listing.price.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : listing.price;
    return `${currency} ${formattedAmount || 0}`;
  };

  const priceText = formatPrice();
  const locationText = [listing.district, listing.province].filter(Boolean).join(", ") || listing.city;

  // Predefined share message
  const shareMessage = `Check out "${listing.title}" (${priceText}) on Wudo Marketplace: ${shareUrl}`;
  const emailSubject = `Check out this listing on Wudo: ${listing.title}`;
  const emailBody = `Hi,\n\nI found this listing on Wudo Marketplace and thought you might be interested:\n\n${listing.title}\nPrice: ${priceText}\n\nView listing: ${shareUrl}\n`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toastSuccess("Link Copied", "Listing link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toastSuccess("Link Copied", "Listing link copied to clipboard!");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out "${listing.title}" (${priceText}) on Wudo Marketplace!`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Social sharing links
  const socialChannels = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "bg-[#25D366] hover:bg-[#20bd5a] text-white",
      border: "hover:border-[#25D366]/40",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      color: "bg-[#1877F2] hover:bg-[#166fe5] text-white",
      border: "hover:border-[#1877F2]/40",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: FaXTwitter,
      color: "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900",
      border: "hover:border-slate-500/40",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      name: "Telegram",
      icon: FaTelegramPlane,
      color: "bg-[#229ED9] hover:bg-[#1e8ec3] text-white",
      border: "hover:border-[#229ED9]/40",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out "${listing.title}" on Wudo!`)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      color: "bg-[#0A66C2] hover:bg-[#095196] text-white",
      border: "hover:border-[#0A66C2]/40",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white",
      border: "hover:border-indigo-500/40",
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share Listing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this ad with friends and social channels
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Listing Preview Card Template */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            {/* Thumbnail */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
              {primaryImageUrl ? (
                <Image
                  src={primaryImageUrl}
                  alt={listing.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  <Image
                    src="/Wudo_watermark.png"
                    alt="Wudo"
                    width={100}
                    height={25}
                    className="h-4 w-auto object-contain opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {listing.categoryName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-md">
                    <Tag className="w-2.5 h-2.5 shrink-0 text-violet-500" />
                    <span className="truncate max-w-[120px]">{listing.categoryName}</span>
                  </span>
                )}
                {locationText && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{locationText}</span>
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {listing.title}
              </h4>

              <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {priceText}
              </div>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Share directly to:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {socialChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <a
                    key={channel.name}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:scale-105 hover:shadow-md transition-all duration-200 group ${channel.border}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${channel.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate text-center">
                      {channel.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Or copy listing link
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Listing URL"
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-hidden font-mono select-all truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Device Share (if available on mobile/tablet) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-violet-500" />
              <span>More Share Options via Device</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
