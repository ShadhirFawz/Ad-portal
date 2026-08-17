export interface ListingImage {

    id: string;

    listingId: string;

    storagePath: string;

    url: string;

    fileName: string | null;

    mimeType: string;

    fileSize: number;

    width: number | null;

    height: number | null;

    displayOrder: number;

    primary: boolean;

    metadata: Record<string, unknown>;

    createdAt: string;
}