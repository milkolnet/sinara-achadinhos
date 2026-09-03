export type PlatformId =
  | 'mercadolivre'
  | 'magalu'
  | 'shopee'
  | 'amazon'
  | 'shein'
  | 'aliexpress'
  | 'tiktok'
  | 'other'
  | (string & {});

export type CategoryId =
  | 'todos'
  | 'casa'
  | 'cozinha'
  | 'beleza'
  | 'tecnologia'
  | 'organizacao'
  | 'moda'
  | 'criativos'
  | 'pets'
  | (string & {});

export type TagBadge =
  | 'viral'
  | 'desconto_max'
  | 'testado_sinara'
  | 'cupom'
  | 'frete_gratis'
  | 'mais_vendido'
  | 'mais_popular'
  | 'cupom_ativo'
  | 'achadinho_ouro';

export interface Product {
  id: string;
  title: string;
  slug?: string;
  description: string;
  sinaraReview?: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  affiliateUrl: string;
  originalUrl?: string;
  resolvedUrl?: string;
  platformUrl?: string;
  imageUrl: string;
  galleryImages?: string[];
  platform: PlatformId;
  category: string;
  subcategory?: string;
  couponCode?: string;
  couponDiscount?: string;
  badges: TagBadge[];
  likesCount: number;
  clicksCount: number;
  isFeatured?: boolean;
  isGoldFind?: boolean;
  isWeeklyHighlight?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
  installments?: string;
}

export interface Coupon {
  id: string;
  code: string;
  store: string;
  platform: PlatformId;
  description: string;
  discount: string;
  minimumSpend?: number;
  validUntil?: string;
  validFrom?: string;
  affiliateUrl?: string;
  copyCount: number;
  badge?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  emoji: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  domains: string[];
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderColor: string;
  lightBg: string;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClickEvent {
  id: string;
  productId: string;
  productTitle: string;
  platform: string;
  visitorIpHash?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}

export interface DailyClicks {
  date: string;
  clicks: number;
}

export interface AnalyticsData {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  productsWithCoupon: number;
  totalClicks: number;
  clicksToday: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  topProducts: {
    id: string;
    title: string;
    imageUrl: string;
    platform: string;
    price: number;
    clicks: number;
  }[];
  platformStats: {
    platform: string;
    name: string;
    productCount: number;
    clicks: number;
  }[];
  categoryStats: {
    category: string;
    name: string;
    productCount: number;
    clicks: number;
  }[];
  dailyClicks: DailyClicks[];
}

export interface AdminUser {
  username: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export interface LinkAnalysisResult {
  platform: PlatformId;
  platformName: string;
  affiliateUrl: string;
  originalUrl?: string;
  resolvedUrl?: string;
  suggestedTitle?: string;
  suggestedImage?: string;
  suggestedPrice?: number;
  suggestedOriginalPrice?: number;
  suggestedDescription?: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  sinaraBio: string;
  whatsappGroupUrl: string;
  telegramChannelUrl: string;
  instagramUrl: string;
  goldFindProductId: string;
  mainFeaturedId: string;
  weeklyHighlightId: string;
}

export interface FilterState {
  searchQuery: string;
  category: CategoryId;
  platform: PlatformId | 'todas';
  priceMax: number | null;
  selectedTag: TagBadge | 'todos';
  sortBy: 'popular' | 'desconto' | 'menor_preco' | 'recentes';
  onlyWithCoupon: boolean;
  onlySinaraTested: boolean;
  onlyFreeShipping: boolean;
}

