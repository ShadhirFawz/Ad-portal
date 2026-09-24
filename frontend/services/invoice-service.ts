import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@/lib/supabase/client";
import type { AdBoost, BoostType } from "@/types/boost";
import type { UserResponse } from "@/types/auth";

const BUCKET_NAME = "invoices";
const FALLBACK_BUCKET = "listing-images";

/**
 * Maps boost type to clean human-readable name.
 */
function getBoostPlanName(type?: BoostType | string): string {
  switch (type) {
    case "POWER_PACK":
      return "Power Pack Bundle";
    case "SPOTLIGHT":
      return "Spotlight Promotion";
    case "URGENT":
      return "Urgent Priority Booster";
    case "PUSH_UP":
      return "Push Up Promotion";
    default:
      return type ? type.replace(/_/g, " ") + " Package" : "Ad Promotion Package";
  }
}

/**
 * Formats date into readable string.
 */
function formatPdfDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats date and time into readable string.
 */
function formatPdfDateTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Loads logo image as base64 data URL for jsPDF embedding.
 */
async function loadLogoBase64(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/Wudo_logo_light.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not load Wudo logo for PDF:", err);
    return null;
  }
}

/**
 * Generates an official, print-standard PDF invoice for an AdBoost purchase.
 * Strictly adheres to monochrome (black, slate, white) with consistent emerald brand accent.
 */
export async function generateInvoicePdf(
  boost: AdBoost,
  user?: UserResponse | null
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;

  // Colors
  const primaryBlack: [number, number, number] = [15, 23, 42]; // Slate-900 / Dark Charcoal
  const secondarySlate: [number, number, number] = [71, 85, 105]; // Slate-600
  const lightSlate: [number, number, number] = [148, 163, 184]; // Slate-400
  const borderSlate: [number, number, number] = [226, 232, 240]; // Slate-200
  const cardBg: [number, number, number] = [248, 250, 252]; // Slate-50
  const themeEmerald: [number, number, number] = [5, 150, 105]; // Emerald-600
  const white: [number, number, number] = [255, 255, 255];

  // Try loading logo
  const logoBase64 = await loadLogoBase64();

  // Top header line accent (Emerald theme)
  doc.setFillColor(...themeEmerald);
  doc.rect(0, 0, pageWidth, 4, "F");

  let currentY = 14;

  // 1. Logo & Header
  if (logoBase64) {
    try {
      // Dimensions: width: 38mm, height: ~14mm
      doc.addImage(logoBase64, "PNG", margin, currentY, 38, 38);
    } catch {
      // Fallback text logo if image fails
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...primaryBlack);
      doc.text("WUDO", margin, currentY + 9);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryBlack);
    doc.text("WUDO", margin, currentY + 9);
  }

  // Header Right: Title & Invoice Meta
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryBlack);
  doc.text("OFFICIAL TAX INVOICE", rightX, currentY + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...secondarySlate);
  const orderRef = boost.orderId || boost.id.substring(0, 8).toUpperCase();
  doc.text(`Invoice No: INV-${orderRef}`, rightX, currentY + 9, { align: "right" });
  doc.text(`Issued Date: ${formatPdfDateTime(boost.createdAt || new Date().toISOString())}`, rightX, currentY + 13.5, { align: "right" });

  // Paid Status Pill (Top Right)
  const isPaid =
    boost.paymentStatus === "COMPLETED" ||
    boost.boostStatus === "ACTIVE" ||
    boost.boostStatus === "EXPIRED" ||
    boost.boostStatus === "SCHEDULED";

  const statusText = isPaid ? "PAYMENT CONFIRMED • PAID" : "PAYMENT PENDING";
  const statusBg = isPaid ? themeEmerald : secondarySlate;

  doc.setFillColor(...statusBg);
  doc.roundedRect(rightX - 52, currentY + 16, 52, 6, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...white);
  doc.text(statusText, rightX - 26, currentY + 20.2, { align: "center" });

  currentY += 46;

  // Divider Line
  doc.setDrawColor(...borderSlate);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, rightX, currentY);

  currentY += 6;

  // 2. Issuer & Billed-To Grid (2 Columns)
  const colWidth = usableWidth / 2;

  // Left Column: Issuer Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...lightSlate);
  doc.text("ISSUED BY:", margin, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryBlack);
  doc.text("Wudo Marketplace (Pvt) Ltd", margin, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondarySlate);
  doc.text("Digital Advertising & Classifieds Division", margin, currentY + 8.5);
  doc.text("Level 4, Access Towers, Colombo 02, Sri Lanka", margin, currentY + 12.5);
  doc.text("Reg: PV-00298412 • Email: billing@wudo.lk", margin, currentY + 16.5);
  doc.text("Official Website: www.wudo.lk", margin, currentY + 20.5);

  // Right Column: Customer Info
  const rightColX = margin + colWidth + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...lightSlate);
  doc.text("BILLED TO / ADVERTISER:", rightColX, currentY);

  const customerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    (user?.email ? user.email.split("@")[0] : "Valued Advertiser");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryBlack);
  doc.text(customerName, rightColX, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondarySlate);
  doc.text(`Email: ${user?.email || "Account on file"}`, rightColX, currentY + 8.5);
  doc.text(`Phone: ${user?.phoneNumber || "N/A"}`, rightColX, currentY + 12.5);
  doc.text(`Customer Ref: ${user?.id ? user.id.substring(0, 14) + "..." : "User Account"}`, rightColX, currentY + 16.5);
  doc.text(`Location: ${user?.location || "Sri Lanka"}`, rightColX, currentY + 20.5);

  currentY += 26;

  // 3. Transaction Summary Info Box
  doc.setFillColor(...cardBg);
  // 3. Transaction Summary Info Box (3 Balanced Columns: Order Ref, Gateway, Transaction ID)
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderSlate);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, usableWidth, 16, 2, 2, "FD");

  const boxColWidth = usableWidth / 3;
  const boxY = currentY + 4.5;

  // Box Item 1: Order ID
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightSlate);
  doc.text("ORDER REFERENCE", margin + 6, boxY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryBlack);
  doc.text(boost.orderId || "N/A", margin + 6, boxY + 5.5, { maxWidth: boxColWidth - 10 });

  // Box Item 2: Payment Gateway
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightSlate);
  doc.text("PAYMENT GATEWAY", margin + boxColWidth + 6, boxY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryBlack);
  doc.text("PayHere Lanka (Pvt) Ltd", margin + boxColWidth + 6, boxY + 5.5, { maxWidth: boxColWidth - 10 });

  // Box Item 3: Gateway Payment Ref
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightSlate);
  doc.text("GATEWAY TRANSACTION ID", margin + boxColWidth * 2 + 6, boxY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryBlack);
  const displayPaymentId = boost.payherePaymentId || (boost.paymentId ? `REF-${boost.paymentId.substring(0, 8)}` : "VERIFIED-PAYMENT");
  doc.text(displayPaymentId, margin + boxColWidth * 2 + 6, boxY + 5.5, { maxWidth: boxColWidth - 10 });

  currentY += 21;



  // 4. Subscription Package Table
  const packageName = getBoostPlanName(boost.boostType);
  const currency = boost.currency || "LKR";
  const amount = Number(boost.amount || 0);

  const tableData = [
    [
      {
        content: `${packageName}\nTarget Ad: "${boost.listingTitle || "Marketplace Listing"}"\nListing Ref: #${boost.listingId?.substring(0, 10) || "N/A"}`,
        styles: { fontStyle: "normal" as const },
      },
      `${formatPdfDate(boost.startsAt)}\nto ${formatPdfDate(boost.expiresAt)}`,
      `${boost.durationDays || 7} Days`,
      `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["PROMOTION PACKAGE / ITEM", "SCHEDULE PERIOD", "DURATION", "UNIT PRICE", "AMOUNT"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: primaryBlack,
      textColor: white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: primaryBlack,
      cellPadding: 4,
      lineColor: borderSlate,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 38 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
    },
  });

  // Calculate position after table
  const finalTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  currentY = finalTableY;

  // 5. Financial Summary Breakdown (Right Aligned)
  const summaryWidth = 72;
  const summaryX = pageWidth - margin - summaryWidth;

  // Subtotal row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondarySlate);
  doc.text("Subtotal Amount:", summaryX, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlack);
  doc.text(`${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightX, currentY + 4, { align: "right" });

  // Tax / VAT row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondarySlate);
  doc.text("Taxes & Gateway Fees:", summaryX, currentY + 9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlack);
  doc.text("LKR 0.00 (Inclusive)", rightX, currentY + 9, { align: "right" });

  // Total Paid box
  doc.setFillColor(...primaryBlack);
  doc.roundedRect(summaryX - 2, currentY + 12, summaryWidth + 2, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...white);
  doc.text("TOTAL PAID:", summaryX + 2, currentY + 17);
  doc.text(`${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightX - 2, currentY + 17, { align: "right" });

  currentY += 26;

  currentY += 3.5;

  const badgeCardWidth = (usableWidth - 8) / 3;
  const badgeCardHeight = 22;

  currentY += badgeCardHeight + 6;

  // 7. Legal Notice & Electronic Signature Disclaimer
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderSlate);
  doc.roundedRect(margin, currentY, usableWidth, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...secondarySlate);
  doc.text("ELECTRONIC RECEIPT NOTICE & POLICY", margin + 3, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...secondarySlate);
  doc.text(
    "This document is an electronically generated proof of payment and does not require a physical signature. Retain this invoice for accounting and tax records. Ad promotions are non-transferable and subject to Wudo Marketplace Terms of Service. For customer service or inquiries, contact billing@wudo.lk.",
    margin + 3,
    currentY + 8,
    { maxWidth: usableWidth - 6 }
  );

  // 8. Footer (Bottom of Page)
  const footerY = pageHeight - 12;
  doc.setDrawColor(...borderSlate);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, rightX, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...lightSlate);
  doc.text("Wudo Marketplace (Pvt) Ltd • www.wudo.lk • Secure Cloud Billing System", margin, footerY + 4.5);
  doc.text(`Page 1 of 1 • Ref: ${orderRef}`, rightX, footerY + 4.5, { align: "right" });

  return doc;
}

/**
 * Uploads the generated PDF blob to Supabase Storage for permanent safe keeping.
 */
export async function uploadInvoiceToSupabase(
  pdfBlob: Blob,
  orderId: string,
  userId?: string
): Promise<{ publicUrl: string; path: string }> {
  const supabase = createClient();
  const safeOrderId = orderId || `BOOST-${Date.now()}`;
  const safeUserId = userId || "general";
  const filePath = `invoices/${safeUserId}/${safeOrderId}.pdf`;

  // First try 'invoices' bucket, if not found fallback to listing-images bucket with invoices/ prefix
  let uploadBucket = BUCKET_NAME;
  let { data, error } = await supabase.storage
    .from(uploadBucket)
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      cacheControl: "31536000",
      upsert: true,
    });

  if (error) {
    console.warn(`Upload to '${uploadBucket}' bucket failed (${error.message}), attempting fallback to '${FALLBACK_BUCKET}'...`);
    uploadBucket = FALLBACK_BUCKET;
    const fallbackRes = await supabase.storage
      .from(uploadBucket)
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        cacheControl: "31536000",
        upsert: true,
      });

    if (fallbackRes.error) {
      console.error("Supabase invoice storage fallback error:", fallbackRes.error);
      throw new Error(`Failed to upload invoice to Supabase: ${fallbackRes.error.message}`);
    }
    data = fallbackRes.data;
  }

  const { data: publicUrlData } = supabase.storage
    .from(uploadBucket)
    .getPublicUrl(filePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    path: data?.path || filePath,
  };
}

/**
 * Downloads the invoice PDF directly to user's device.
 */
export async function downloadInvoicePdf(
  boost: AdBoost,
  user?: UserResponse | null
): Promise<void> {
  const doc = await generateInvoicePdf(boost, user);
  const orderRef = boost.orderId || boost.id.substring(0, 8);
  doc.save(`Wudo-Invoice-${orderRef}.pdf`);
}

/**
 * Triggers native browser print dialog for the invoice PDF.
 */
export async function printInvoicePdf(
  boost: AdBoost,
  user?: UserResponse | null
): Promise<void> {
  const doc = await generateInvoicePdf(boost, user);
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = blobUrl;

  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Direct iframe print failed, opening in new window:", e);
      window.open(blobUrl, "_blank");
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(iframe);
      }, 60000);
    }
  };
}

/**
 * Generates invoice, saves it safely to Supabase storage, and returns the PDF blob and public URL.
 */
export async function generateAndSaveInvoice(
  boost: AdBoost,
  user?: UserResponse | null
): Promise<{ blob: Blob; publicUrl?: string; storagePath?: string }> {
  const doc = await generateInvoicePdf(boost, user);
  const blob = doc.output("blob");
  const orderRef = boost.orderId || boost.id.substring(0, 8);

  try {
    const storageResult = await uploadInvoiceToSupabase(blob, orderRef, user?.id);
    return {
      blob,
      publicUrl: storageResult.publicUrl,
      storagePath: storageResult.path,
    };
  } catch (err) {
    console.warn("Could not save invoice to Supabase Storage:", err);
    return { blob };
  }
}
