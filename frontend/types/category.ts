export interface Category {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  parentId: string | null;
  iconUrl: string | null;
  displayOrder: number;
  level: number;
  active: boolean;
  allowListings: boolean;
  metadata: Record<string, unknown>;
}