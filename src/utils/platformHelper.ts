import { PlatformId, CategoryId, TagBadge } from '../types';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderColor: string;
  lightBg: string;
  iconName: string;
  urlDomains: string[];
}

export const PLATFORMS_CONFIG: Record<PlatformId, PlatformConfig> = {
  mercadolivre: {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    shortName: 'Mercado Livre',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#4338CA] font-bold',
    accentColor: '#4338CA',
    borderColor: 'border-[#C7D2FE]',
    lightBg: 'bg-[#EEF2FF]',
    iconName: 'ShoppingBag',
    urlDomains: ['mercadolivre.com.br', 'mercadolivre.com', 'meli.la', 'mlb.'],
  },
  magalu: {
    id: 'magalu',
    name: 'Magazine Luiza (Magalu)',
    shortName: 'Magalu',
    badgeBg: 'bg-[#D1FAE5]',
    badgeText: 'text-[#059669] font-bold',
    accentColor: '#059669',
    borderColor: 'border-[#A7F3D0]',
    lightBg: 'bg-[#ECFDF5]',
    iconName: 'ShoppingBag',
    urlDomains: ['magazineluiza.com.br', 'magalu.com', 'mglu.io'],
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    shortName: 'Shopee',
    badgeBg: 'bg-[#FFEDD5]',
    badgeText: 'text-[#D97706] font-bold',
    accentColor: '#D97706',
    borderColor: 'border-[#FED7AA]',
    lightBg: 'bg-[#FFF7ED]',
    iconName: 'Flame',
    urlDomains: ['shopee.com.br', 'shope.ee', 'shopee.com'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Brasil',
    shortName: 'Amazon',
    badgeBg: 'bg-[#FFE4E6]',
    badgeText: 'text-[#E11D48] font-bold',
    accentColor: '#E11D48',
    borderColor: 'border-[#FECDD3]',
    lightBg: 'bg-[#FFF1F2]',
    iconName: 'PackageCheck',
    urlDomains: ['amazon.com.br', 'amazon.com', 'amzn.to'],
  },
  shein: {
    id: 'shein',
    name: 'Shein',
    shortName: 'Shein',
    badgeBg: 'bg-[#F5F3FF]',
    badgeText: 'text-[#6D28D9] font-bold',
    accentColor: '#6D28D9',
    borderColor: 'border-[#DDD6FE]',
    lightBg: 'bg-[#FAF5FF]',
    iconName: 'Sparkles',
    urlDomains: ['shein.com', 'shein.com.br', 'm.shein.com'],
  },
  aliexpress: {
    id: 'aliexpress',
    name: 'AliExpress',
    shortName: 'AliExpress',
    badgeBg: 'bg-[#FEE2E2]',
    badgeText: 'text-[#DC2626] font-bold',
    accentColor: '#DC2626',
    borderColor: 'border-[#FECACA]',
    lightBg: 'bg-[#FEF2F2]',
    iconName: 'Globe',
    urlDomains: ['aliexpress.com', 'pt.aliexpress.com', 's.click.aliexpress.com'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    shortName: 'TikTok',
    badgeBg: 'bg-[#ECFEFF]',
    badgeText: 'text-[#0E7490] font-bold',
    accentColor: '#0E7490',
    borderColor: 'border-[#A5F3FC]',
    lightBg: 'bg-[#F0FDFA]',
    iconName: 'Video',
    urlDomains: ['tiktok.com', 'shop.tiktok.com', 'vt.tiktok.com'],
  },
  other: {
    id: 'other',
    name: 'Loja Parceira',
    shortName: 'Loja',
    badgeBg: 'bg-[#F1F5F9]',
    badgeText: 'text-[#475569] font-bold',
    accentColor: '#475569',
    borderColor: 'border-[#E2E8F0]',
    lightBg: 'bg-[#F8FAFC]',
    iconName: 'ExternalLink',
    urlDomains: [],
  },
};

export const CATEGORIES_CONFIG: { id: CategoryId; name: string; icon: string; emoji: string }[] = [
  { id: 'todos', name: 'Todos os Achados', icon: 'Grid', emoji: '✨' },
  { id: 'casa', name: 'Casa & Decoração', icon: 'Home', emoji: '🏡' },
  { id: 'cozinha', name: 'Cozinha Mágica', icon: 'Utensils', emoji: '🍳' },
  { id: 'organizacao', name: 'Organização', icon: 'Boxes', emoji: '📦' },
  { id: 'tecnologia', name: 'Gadgets & Tech', icon: 'Cpu', emoji: '⚡' },
  { id: 'beleza', name: 'Beleza & Autocuidado', icon: 'Sparkles', emoji: '💄' },
  { id: 'moda', name: 'Moda & Acessórios', icon: 'Shirt', emoji: '👗' },
  { id: 'criativos', name: 'Achados Criativos', icon: 'Lightbulb', emoji: '💡' },
  { id: 'pets', name: 'Mundo Pet', icon: 'HeartHandshake', emoji: '🐾' },
];

export const BADGES_CONFIG: Record<TagBadge, { label: string; emoji: string; bg: string; text: string; border: string }> = {
  testado_sinara: {
    label: 'Testado pela Sinara',
    emoji: '💖',
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#FF3B7F] font-bold',
    border: 'border-[#FFE4E6]',
  },
  viral: {
    label: 'Viral das Redes',
    emoji: '🔥',
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#D97706] font-bold',
    border: 'border-[#FED7AA]',
  },
  desconto_max: {
    label: 'Super Desconto',
    emoji: '📉',
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669] font-bold',
    border: 'border-[#A7F3D0]',
  },
  cupom: {
    label: 'Tem Cupom Ativo',
    emoji: '🏷️',
    bg: 'bg-[#E0E7FF]',
    text: 'text-[#4338CA] font-bold',
    border: 'border-[#C7D2FE]',
  },
  frete_gratis: {
    label: 'Frete Grátis',
    emoji: '🚚',
    bg: 'bg-[#F0FDFA]',
    text: 'text-[#0D9488] font-bold',
    border: 'border-[#CCFBF1]',
  },
  mais_vendido: {
    label: 'Mais Vendido',
    emoji: '⭐',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#6D28D9] font-bold',
    border: 'border-[#DDD6FE]',
  },
  mais_popular: {
    label: 'Mais Popular',
    emoji: '🏆',
    bg: 'bg-[#FEF9C3]',
    text: 'text-[#A16207] font-bold',
    border: 'border-[#FEF08A]',
  },
  cupom_ativo: {
    label: 'Cupom Ativo',
    emoji: '🎟️',
    bg: 'bg-[#E0E7FF]',
    text: 'text-[#4338CA] font-bold',
    border: 'border-[#C7D2FE]',
  },
  achadinho_ouro: {
    label: 'Achadinho de Ouro',
    emoji: '👑',
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309] font-black',
    border: 'border-[#FDE68A]',
  },
};

export function detectPlatformFromUrl(url: string): PlatformId {
  if (!url) return 'other';
  const cleanUrl = url.toLowerCase();

  for (const [platformKey, config] of Object.entries(PLATFORMS_CONFIG)) {
    if (config.urlDomains.some((domain) => cleanUrl.includes(domain))) {
      return platformKey as PlatformId;
    }
  }

  return 'other';
}

export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return '';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function calculateDiscount(price: number | undefined | null, originalPrice: number | undefined | null): number {
  const p = Number(price);
  const orig = Number(originalPrice);
  if (isNaN(p) || isNaN(orig) || orig <= 0 || p <= 0 || orig <= p) return 0;
  const discount = Math.round(((orig - p) / orig) * 100);
  return discount > 0 ? discount : 0;
}
