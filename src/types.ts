export type PageRoute =
  | 'home'
  | 'collections'
  | 'gallery'
  | 'purchase'
  | 'contact'
  | 'admin';

export type SareeCategory =
  | 'Kata Linen Sarees'
  | 'Tana Pattu Sarees'
  | 'Dola Silk Check Sarees'
  | 'Ajrak Mirror Sarees'
  | 'Daily Wear Sarees'
  | 'Kanchipuram Silk Sarees'
  | 'Pochampally Ikkat Sarees'
  | 'Bandhani Sarees'
  | 'Patola Sarees'
  | 'Traditional Sarees'
  | 'Designer Sarees';

export const SAREE_CATEGORIES: SareeCategory[] = [
  'Kata Linen Sarees',
  'Tana Pattu Sarees',
  'Dola Silk Check Sarees',
  'Ajrak Mirror Sarees',
  'Daily Wear Sarees',
  'Kanchipuram Silk Sarees',
  'Pochampally Ikkat Sarees',
  'Bandhani Sarees',
  'Patola Sarees',
  'Traditional Sarees',
  'Designer Sarees',
];

export type AvailabilityStatus = 'Available' | 'Made to Order' | 'Sold Out';

export interface SareeProduct {
  id: string;
  name: string;
  category: SareeCategory;
  price: number;
  originalPrice?: number;
  image: string;
  originalImage?: string;
  secondaryImages?: string[];
  description: string;
  availability: AvailabilityStatus;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSample: boolean;
  fabricDetails: string;
  blouseIncluded: string;
  lengthSpec: string;
  careInstructions: string;
  sku?: string;
}

export type GallerySection = 'Silk' | 'Traditional' | 'Designer' | 'Festive';

export interface GalleryItem {
  id: string;
  title: string;
  section: GallerySection;
  categoryLabel: string;
  image: string;
  caption: string;
  linkedProductId?: string;
}

export interface SiteSettings {
  instagramHandle: string;
  instagramUrl: string;
  hoursWeekdays: string;
  hoursSunday: string;
  announcementText: string;
  founderPortraitUrl?: string;
}

export interface StoreData {
  products: SareeProduct[];
  gallery: GalleryItem[];
  settings: SiteSettings;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  productName?: string;
  createdAt: string;
}
