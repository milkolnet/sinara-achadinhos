import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  Product,
  Coupon,
  CategoryItem,
  PlatformItem,
  ClickEvent,
  AnalyticsData,
  SiteSettings,
  AdminUser,
} from '../src/types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../src/data/initialData';
import { CATEGORIES_CONFIG, PLATFORMS_CONFIG } from '../src/utils/platformHelper';
import { hashClientIp } from './security';

export interface DatabaseSchema {
  adminUsers?: AdminUser[];
  products: Product[];
  coupons: Coupon[];
  categories: CategoryItem[];
  platforms: PlatformItem[];
  clicks: ClickEvent[];
  settings: SiteSettings;
  version: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// --- PRISMA MAPPERS ---
function mapPrismaProductToFrontend(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    sinaraReview: p.sinaraReview || undefined,
    price: p.price,
    originalPrice: p.originalPrice,
    discountPercent: p.discountPercent,
    originalUrl: p.originalUrl || undefined,
    resolvedUrl: p.resolvedUrl || undefined,
    affiliateUrl: p.affiliateUrl,
    platformUrl: p.platformUrl || undefined,
    imageUrl: p.imageUrl,
    galleryImages: p.galleryImages || [],
    platform: p.platformId as any,
    category: p.categoryId as any,
    subcategory: p.subcategory || undefined,
    couponCode: p.couponCode || undefined,
    couponDiscount: p.couponDiscount || undefined,
    badges: (p.badges || []) as any,
    likesCount: p.likesCount,
    clicksCount: p.clicksCount,
    isFeatured: p.isFeatured,
    isGoldFind: p.isGoldFind,
    isWeeklyHighlight: p.isWeeklyHighlight,
    isActive: p.isActive,
    isVerified: p.isVerified,
    installments: p.installments || undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  };
}

function mapPrismaCouponToFrontend(c: any): Coupon {
  return {
    id: c.id,
    code: c.code,
    store: c.store,
    platform: c.platformId || undefined,
    description: c.description || undefined,
    discount: c.discount,
    minimumSpend: c.minimumSpend,
    validUntil: c.validUntil ? new Date(c.validUntil).toISOString() : undefined,
    validFrom: c.validFrom ? new Date(c.validFrom).toISOString() : undefined,
    affiliateUrl: c.affiliateUrl || undefined,
    copyCount: c.copyCount,
    badge: c.badge,
    isActive: c.isActive,
    isFeatured: c.isFeatured,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
  };
}

function mapPrismaCategoryToFrontend(cat: any): CategoryItem {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    emoji: cat.emoji,
    order: cat.order,
    isActive: cat.isActive,
    createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : undefined,
    updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : undefined,
  };
}

function mapPrismaPlatformToFrontend(p: any): PlatformItem {
  return {
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    slug: p.slug,
    domains: p.domains || [],
    badgeBg: p.badgeBg,
    badgeText: p.badgeText,
    accentColor: p.accentColor,
    borderColor: p.borderColor,
    lightBg: p.lightBg,
    isActive: p.isActive,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  };
}

function getDefaultSchema(): DatabaseSchema {
  const now = new Date().toISOString();

  const initialCategories: CategoryItem[] = CATEGORIES_CONFIG
    .filter((c) => c.id !== 'todos')
    .map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.id,
      icon: cat.icon,
      emoji: cat.emoji,
      order: idx + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

  const initialPlatforms: PlatformItem[] = Object.values(PLATFORMS_CONFIG).map((p) => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    slug: p.id,
    domains: [...p.urlDomains],
    badgeBg: p.badgeBg,
    badgeText: p.badgeText,
    accentColor: p.accentColor,
    borderColor: p.borderColor,
    lightBg: p.lightBg,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  const initialProducts: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
    ...p,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
    isActive: true,
    isGoldFind: idx === 0,
    isWeeklyHighlight: idx === 1 || idx === 2,
    originalUrl: p.affiliateUrl,
    resolvedUrl: p.affiliateUrl,
    affiliateUrl: p.affiliateUrl, // Sacred affiliate link
    platformUrl: p.affiliateUrl,
    createdAt: p.createdAt || now,
    updatedAt: p.createdAt || now,
  }));

  const initialCoupons: Coupon[] = INITIAL_COUPONS.map((c) => ({
    ...c,
    isActive: true,
    isFeatured: true,
    createdAt: now,
    updatedAt: now,
  }));

  // Initial seed clicks for analytics visual charts
  const sampleClicks: ClickEvent[] = [];
  const nowMs = Date.now();
  for (let i = 0; i < 40; i++) {
    const prod = initialProducts[i % initialProducts.length];
    const pastHours = Math.floor(Math.random() * (24 * 14));
    sampleClicks.push({
      id: `clk-seed-${i}`,
      productId: prod.id,
      productTitle: prod.title,
      platform: prod.platform,
      visitorIpHash: crypto.createHash('sha256').update(`seed-ip-${i}`).digest('hex').slice(0, 16),
      timestamp: new Date(nowMs - pastHours * 3600 * 1000).toISOString(),
    });
  }

  return {
    adminUsers: [
      {
        username: 'admin',
        name: 'Sinara (Administradora)',
        role: 'super_admin',
      },
    ],
    products: initialProducts,
    coupons: initialCoupons,
    categories: initialCategories,
    platforms: initialPlatforms,
    clicks: sampleClicks,
    settings: {
      siteTitle: 'Sinara Achadinhos da Internet',
      tagline: 'Garimpos, novidades e ofertas reais verificadas com carinho',
      sinaraBio:
        'Curadora oficial de achadinhos da internet. Testo, seleciono e garimpo os melhores preços em Magalu, Shopee, Mercado Livre, Amazon e muito mais!',
      whatsappGroupUrl: 'https://chat.whatsapp.com/sample',
      telegramChannelUrl: 'https://t.me/sample',
      instagramUrl: 'https://instagram.com/sinaraachadinhos',
      goldFindProductId: 'prod-1',
      mainFeaturedId: 'prod-1',
      weeklyHighlightId: 'prod-3',
    },
    version: 2,
  };
}

class DatabaseService {
  private prisma: PrismaClient | null = null;
  private db: DatabaseSchema;
  private isLoaded = false;
  private lastBackupTime = 0;
  private isPostgresActive = false;

  constructor() {
    this.db = getDefaultSchema();
    this.init();
  }

  private init() {
    // 1. Check production requirement
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      throw new Error(
        '[CONFIG FATAL EM PRODUÇÃO] A variável DATABASE_URL é estritamente obrigatória no ambiente de produção. O Sinara Achadinhos exige PostgreSQL para garantir integridade relacional e auditoria. Operação abortada para evitar uso acidental de database.json em produção.'
      );
    }

    // 2. Initialize PostgreSQL if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient();
        this.isPostgresActive = true;
        console.log('[DB] PostgreSQL configurado como motor principal de persistência.');
        this.bootstrapPostgresIfNeeded().catch((err) => {
          console.error('[DB] Erro no bootstrap PostgreSQL:', err);
        });
      } catch (err) {
        console.error('[DB] Falha ao instanciar Prisma Client:', err);
      }
    } else {
      console.log(
        '[DB WARNING] DATABASE_URL não informada. Operando em modo de desenvolvimento local com persistência em /data/database.json.'
      );
    }

    // Initialize local JSON fallback
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products)) {
          this.db = {
            ...getDefaultSchema(),
            ...parsed,
          };
          this.isLoaded = true;
          return;
        }
      }

      this.saveToDisk();
      this.isLoaded = true;
    } catch (err) {
      console.error('[DB] Erro ao carregar database.json:', err);
      this.db = getDefaultSchema();
      this.isLoaded = true;
    }
  }

  private async bootstrapPostgresIfNeeded(): Promise<void> {
    if (!this.prisma) return;
    try {
      await this.prisma.$connect();
      const categoriesCount = await this.prisma.category.count();
      if (categoriesCount === 0) {
        console.log('[DB] PostgreSQL vazio detectado. Realizando bootstrap inicial dos dados...');
        const defaults = getDefaultSchema();

        for (const cat of defaults.categories) {
          await this.prisma.category.upsert({
            where: { id: cat.id },
            update: {},
            create: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon,
              emoji: cat.emoji,
              order: cat.order,
              isActive: cat.isActive,
            },
          });
        }

        for (const plat of defaults.platforms) {
          await this.prisma.platform.upsert({
            where: { id: plat.id },
            update: {},
            create: {
              id: plat.id,
              name: plat.name,
              shortName: plat.shortName,
              slug: plat.slug,
              domains: plat.domains,
              badgeBg: plat.badgeBg,
              badgeText: plat.badgeText,
              accentColor: plat.accentColor,
              borderColor: plat.borderColor,
              lightBg: plat.lightBg,
              isActive: plat.isActive,
            },
          });
        }

        for (const prod of defaults.products) {
          await this.prisma.product.upsert({
            where: { id: prod.id },
            update: {},
            create: {
              id: prod.id,
              title: prod.title,
              slug: prod.slug,
              description: prod.description,
              sinaraReview: prod.sinaraReview || null,
              price: prod.price,
              originalPrice: prod.originalPrice,
              discountPercent: prod.discountPercent,
              originalUrl: prod.originalUrl || prod.affiliateUrl,
              resolvedUrl: prod.resolvedUrl || prod.affiliateUrl,
              affiliateUrl: prod.affiliateUrl,
              platformUrl: prod.platformUrl || prod.affiliateUrl,
              imageUrl: prod.imageUrl,
              galleryImages: prod.galleryImages || [],
              platformId: prod.platform,
              categoryId: prod.category,
              couponCode: prod.couponCode || null,
              couponDiscount: prod.couponDiscount || null,
              badges: prod.badges || [],
              likesCount: prod.likesCount || 0,
              clicksCount: prod.clicksCount || 0,
              isFeatured: prod.isFeatured || false,
              isGoldFind: prod.isGoldFind || false,
              isWeeklyHighlight: prod.isWeeklyHighlight || false,
              isActive: prod.isActive !== false,
              isVerified: prod.isVerified !== false,
            },
          });
        }

        for (const coup of defaults.coupons) {
          await this.prisma.coupon.upsert({
            where: { id: coup.id },
            update: {},
            create: {
              id: coup.id,
              code: coup.code,
              store: coup.store,
              platformId: coup.platform || null,
              discount: coup.discount,
              minimumSpend: coup.minimumSpend || 0,
              badge: coup.badge || 'Verificado',
              isActive: coup.isActive !== false,
              isFeatured: coup.isFeatured || false,
            },
          });
        }

        await this.prisma.siteSettings.upsert({
          where: { id: 'default' },
          update: {},
          create: {
            id: 'default',
            siteTitle: defaults.settings.siteTitle,
            tagline: defaults.settings.tagline,
            sinaraBio: defaults.settings.sinaraBio,
            whatsappGroupUrl: defaults.settings.whatsappGroupUrl || null,
            telegramChannelUrl: defaults.settings.telegramChannelUrl || null,
            instagramUrl: defaults.settings.instagramUrl || null,
            goldFindProductId: defaults.settings.goldFindProductId || null,
            mainFeaturedId: defaults.settings.mainFeaturedId || null,
            weeklyHighlightId: defaults.settings.weeklyHighlightId || null,
          },
        });
        console.log('[DB] Bootstrap inicial PostgreSQL concluído com sucesso.');
      }
    } catch (err) {
      console.warn('[DB] Não foi possível verificar/executar bootstrap PostgreSQL:', err);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);

      const now = Date.now();
      if (now - this.lastBackupTime > 60 * 60 * 1000) {
        this.lastBackupTime = now;
        const backupPath = path.join(BACKUPS_DIR, `database.backup.${new Date().toISOString().split('T')[0]}.json`);
        fs.copyFileSync(DB_FILE, backupPath);
      }
    } catch (err) {
      console.error('[DB] Erro ao salvar database.json:', err);
    }
  }

  public isPostgres(): boolean {
    return this.isPostgresActive && this.prisma !== null;
  }

  public async checkHealth(): Promise<{ healthy: boolean; engine: 'postgresql' | 'json_persistence'; error?: string }> {
    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        return { healthy: true, engine: 'postgresql' };
      } catch (err: any) {
        return { healthy: false, engine: 'postgresql', error: err.message };
      }
    }
    return { healthy: true, engine: 'json_persistence' };
  }

  // --- PRODUCTS ---
  public async getProducts(options?: {
    activeOnly?: boolean;
    category?: string;
    platform?: string;
    featuredOnly?: boolean;
    search?: string;
  }): Promise<Product[]> {
    if (this.prisma) {
      const where: any = {};
      if (options?.activeOnly) {
        where.isActive = true;
      }
      if (options?.category && options.category !== 'todos') {
        where.categoryId = options.category;
      }
      if (options?.platform && options.platform !== 'todas') {
        where.platformId = options.platform;
      }
      if (options?.featuredOnly) {
        where.OR = [
          { isFeatured: true },
          { isGoldFind: true },
          { isWeeklyHighlight: true },
        ];
      }
      if (options?.search && options.search.trim()) {
        const q = options.search.trim();
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { sinaraReview: { contains: q, mode: 'insensitive' } },
            ],
          },
        ];
      }

      const rows = await this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapPrismaProductToFrontend);
    }

    // JSON fallback
    let result = [...this.db.products];
    if (options?.activeOnly) {
      result = result.filter((p) => p.isActive !== false);
    }
    if (options?.category && options.category !== 'todos') {
      result = result.filter((p) => p.category === options.category);
    }
    if (options?.platform && options.platform !== 'todas') {
      result = result.filter((p) => p.platform === options.platform);
    }
    if (options?.featuredOnly) {
      result = result.filter((p) => p.isFeatured || p.isGoldFind || p.isWeeklyHighlight);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          (p.sinaraReview && p.sinaraReview.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    if (this.prisma) {
      const row = await this.prisma.product.findUnique({ where: { id } });
      return row ? mapPrismaProductToFrontend(row) : undefined;
    }
    return this.db.products.find((p) => p.id === id);
  }

  public async createProduct(data: Partial<Product>): Promise<Product> {
    const id = data.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const affiliateUrl = data.affiliateUrl?.trim() || '';
    const originalUrl = data.originalUrl?.trim() || affiliateUrl;
    const resolvedUrl = data.resolvedUrl?.trim() || affiliateUrl;

    const price = Number(data.price) || 0;
    const originalPrice = Number(data.originalPrice) || price;
    const discountPercent =
      data.discountPercent !== undefined && data.discountPercent >= 0
        ? Number(data.discountPercent)
        : originalPrice > price && originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const title = data.title?.trim() || 'Novo Achadinho';
    const slug = (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 70);

    const platformId = (data.platform || 'other') as string;
    const categoryId = (data.category || 'casa') as string;

    if (this.prisma) {
      // Ensure category and platform exist in PostgreSQL
      await this.ensureCategoryAndPlatformExist(categoryId, platformId);

      const created = await this.prisma.product.create({
        data: {
          id,
          title,
          slug,
          description: data.description?.trim() || '',
          sinaraReview: data.sinaraReview?.trim() || null,
          price,
          originalPrice,
          discountPercent,
          affiliateUrl,
          originalUrl,
          resolvedUrl,
          platformUrl: data.platformUrl?.trim() || affiliateUrl,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
          galleryImages: data.galleryImages || [],
          platformId,
          categoryId,
          subcategory: data.subcategory?.trim() || null,
          couponCode: data.couponCode?.trim() || null,
          couponDiscount: data.couponDiscount?.trim() || null,
          badges: data.badges || [],
          likesCount: 0,
          clicksCount: 0,
          isFeatured: Boolean(data.isFeatured),
          isGoldFind: Boolean(data.isGoldFind),
          isWeeklyHighlight: Boolean(data.isWeeklyHighlight),
          isActive: data.isActive !== false,
          isVerified: data.isVerified !== false,
          installments: data.installments?.trim() || null,
        },
      });
      return mapPrismaProductToFrontend(created);
    }

    // JSON fallback
    const newProduct: Product = {
      id,
      title,
      slug,
      description: data.description?.trim() || '',
      sinaraReview: data.sinaraReview?.trim(),
      price,
      originalPrice,
      discountPercent,
      originalUrl,
      resolvedUrl,
      affiliateUrl,
      platformUrl: data.platformUrl?.trim() || affiliateUrl,
      imageUrl:
        data.imageUrl ||
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      galleryImages: data.galleryImages || [],
      platform: (data.platform || 'other') as any,
      category: (data.category || 'casa') as any,
      subcategory: data.subcategory?.trim(),
      couponCode: data.couponCode?.trim(),
      couponDiscount: data.couponDiscount?.trim(),
      badges: data.badges || [],
      likesCount: 0,
      clicksCount: 0,
      isFeatured: Boolean(data.isFeatured),
      isGoldFind: Boolean(data.isGoldFind),
      isWeeklyHighlight: Boolean(data.isWeeklyHighlight),
      isActive: data.isActive !== false,
      isVerified: data.isVerified !== false,
      installments: data.installments?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.db.products.unshift(newProduct);
    this.saveToDisk();
    return newProduct;
  }

  public async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    if (this.prisma) {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (!existing) return null;

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.sinaraReview !== undefined) updateData.sinaraReview = data.sinaraReview ? data.sinaraReview.trim() : null;
      if (data.price !== undefined) updateData.price = Number(data.price);
      if (data.originalPrice !== undefined) updateData.originalPrice = Number(data.originalPrice);
      if (data.discountPercent !== undefined) updateData.discountPercent = Number(data.discountPercent);
      if (data.affiliateUrl !== undefined) updateData.affiliateUrl = data.affiliateUrl.trim();
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.galleryImages !== undefined) updateData.galleryImages = data.galleryImages;
      if (data.platform !== undefined) {
        await this.ensureCategoryAndPlatformExist(existing.categoryId, data.platform);
        updateData.platformId = data.platform;
      }
      if (data.category !== undefined) {
        await this.ensureCategoryAndPlatformExist(data.category, existing.platformId);
        updateData.categoryId = data.category;
      }
      if (data.couponCode !== undefined) updateData.couponCode = data.couponCode ? data.couponCode.trim() : null;
      if (data.couponDiscount !== undefined) updateData.couponDiscount = data.couponDiscount ? data.couponDiscount.trim() : null;
      if (data.badges !== undefined) updateData.badges = data.badges;
      if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
      if (data.isGoldFind !== undefined) updateData.isGoldFind = Boolean(data.isGoldFind);
      if (data.isWeeklyHighlight !== undefined) updateData.isWeeklyHighlight = Boolean(data.isWeeklyHighlight);
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
      if (data.installments !== undefined) updateData.installments = data.installments ? data.installments.trim() : null;

      const updated = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
      return mapPrismaProductToFrontend(updated);
    }

    const index = this.db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.db.products[index];
    const affiliateUrl = data.affiliateUrl !== undefined ? data.affiliateUrl.trim() : current.affiliateUrl;

    const updated: Product = {
      ...current,
      ...data,
      affiliateUrl,
      updatedAt: new Date().toISOString(),
    };

    this.db.products[index] = updated;
    this.saveToDisk();
    return updated;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    if (this.prisma) {
      try {
        await this.prisma.product.delete({ where: { id } });
        return true;
      } catch (err) {
        return false;
      }
    }

    const index = this.db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.db.products.splice(index, 1);
    this.db.clicks = this.db.clicks.filter((c) => c.productId !== id);
    this.saveToDisk();
    return true;
  }

  public async toggleProductActive(id: string): Promise<Product | null> {
    if (this.prisma) {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (!existing) return null;
      const updated = await this.prisma.product.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
      return mapPrismaProductToFrontend(updated);
    }

    const product = this.db.products.find((p) => p.id === id);
    if (!product) return null;

    product.isActive = !product.isActive;
    product.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return product;
  }

  public async duplicateProduct(id: string): Promise<Product | null> {
    if (this.prisma) {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (!existing) return null;
      const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duplicated = await this.prisma.product.create({
        data: {
          ...existing,
          id: newId,
          title: `${existing.title} (Cópia)`,
          slug: `${existing.slug}-copia-${Date.now().toString().slice(-4)}`,
          clicksCount: 0,
          likesCount: 0,
          isGoldFind: false,
          isWeeklyHighlight: false,
        },
      });
      return mapPrismaProductToFrontend(duplicated);
    }

    const existing = this.db.products.find((p) => p.id === id);
    if (!existing) return null;

    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: Product = {
      ...existing,
      id: newId,
      title: `${existing.title} (Cópia)`,
      slug: `${existing.slug}-copia`,
      clicksCount: 0,
      likesCount: 0,
      isGoldFind: false,
      isWeeklyHighlight: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.products.unshift(duplicated);
    this.saveToDisk();
    return duplicated;
  }

  // --- CATEGORIES ---
  public async getCategories(activeOnly = true): Promise<CategoryItem[]> {
    if (this.prisma) {
      const rows = await this.prisma.category.findMany({
        where: activeOnly ? { isActive: true } : {},
        orderBy: { order: 'asc' },
      });
      return rows.map(mapPrismaCategoryToFrontend);
    }

    const list = activeOnly ? this.db.categories.filter((c) => c.isActive) : this.db.categories;
    return list.map((cat) => ({
      ...cat,
      productCount: this.db.products.filter((p) => p.category === cat.id && p.isActive !== false).length,
    }));
  }

  public async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const id = data.id || data.slug || `cat-${Date.now()}`;
    const name = data.name?.trim() || 'Nova Categoria';
    const slug = data.slug?.trim() || id;
    const now = new Date().toISOString();

    if (this.prisma) {
      const created = await this.prisma.category.create({
        data: {
          id,
          name,
          slug,
          icon: data.icon || 'Tag',
          emoji: data.emoji || '✨',
          order: Number(data.order) || 0,
          isActive: data.isActive !== false,
        },
      });
      return mapPrismaCategoryToFrontend(created);
    }

    const newCat: CategoryItem = {
      id,
      name,
      slug,
      icon: data.icon || 'Tag',
      emoji: data.emoji || '✨',
      order: Number(data.order) || this.db.categories.length + 1,
      isActive: data.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    this.db.categories.push(newCat);
    this.saveToDisk();
    return newCat;
  }

  public async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem | null> {
    if (this.prisma) {
      try {
        const updated = await this.prisma.category.update({
          where: { id },
          data: {
            name: data.name !== undefined ? data.name.trim() : undefined,
            slug: data.slug !== undefined ? data.slug.trim() : undefined,
            icon: data.icon !== undefined ? data.icon : undefined,
            emoji: data.emoji !== undefined ? data.emoji : undefined,
            order: data.order !== undefined ? Number(data.order) : undefined,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
          },
        });
        return mapPrismaCategoryToFrontend(updated);
      } catch (err) {
        return null;
      }
    }

    const cat = this.db.categories.find((c) => c.id === id);
    if (!cat) return null;

    Object.assign(cat, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return cat;
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    if (this.prisma) {
      const inUse = await this.prisma.product.count({ where: { categoryId: id } });
      if (inUse > 0) {
        return {
          success: false,
          message: `Não é possível excluir: existem ${inUse} produtos associados a esta categoria.`,
        };
      }
      try {
        await this.prisma.category.delete({ where: { id } });
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    const inUse = this.db.products.filter((p) => p.category === id).length;
    if (inUse > 0) {
      return {
        success: false,
        message: `Não é possível excluir: existem ${inUse} produtos associados a esta categoria.`,
      };
    }

    const index = this.db.categories.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, message: 'Categoria não encontrada.' };

    this.db.categories.splice(index, 1);
    this.saveToDisk();
    return { success: true };
  }

  // --- PLATFORMS ---
  public async getPlatforms(activeOnly = true): Promise<PlatformItem[]> {
    if (this.prisma) {
      const rows = await this.prisma.platform.findMany({
        where: activeOnly ? { isActive: true } : {},
        orderBy: { name: 'asc' },
      });
      return rows.map(mapPrismaPlatformToFrontend);
    }

    const list = activeOnly ? this.db.platforms.filter((p) => p.isActive) : this.db.platforms;
    return list.map((plat) => ({
      ...plat,
      productCount: this.db.products.filter((p) => p.platform === plat.id && p.isActive !== false).length,
    }));
  }

  public async createPlatform(data: Partial<PlatformItem>): Promise<PlatformItem> {
    const id = data.id || data.slug || `plat-${Date.now()}`;
    const name = data.name?.trim() || 'Nova Plataforma';
    const shortName = data.shortName?.trim() || name;
    const slug = data.slug?.trim() || id;
    const now = new Date().toISOString();

    if (this.prisma) {
      const created = await this.prisma.platform.create({
        data: {
          id,
          name,
          shortName,
          slug,
          domains: data.domains || [],
          badgeBg: data.badgeBg || 'bg-[#F1F5F9]',
          badgeText: data.badgeText || 'text-[#475569] font-bold',
          accentColor: data.accentColor || '#FF3B7F',
          borderColor: data.borderColor || 'border-[#E2E8F0]',
          lightBg: data.lightBg || 'bg-[#F8FAFC]',
          isActive: data.isActive !== false,
        },
      });
      return mapPrismaPlatformToFrontend(created);
    }

    const newPlat: PlatformItem = {
      id,
      name,
      shortName,
      slug,
      domains: data.domains || [],
      badgeBg: data.badgeBg || 'bg-[#F1F5F9]',
      badgeText: data.badgeText || 'text-[#475569] font-bold',
      accentColor: data.accentColor || '#FF3B7F',
      borderColor: data.borderColor || 'border-[#E2E8F0]',
      lightBg: data.lightBg || 'bg-[#F8FAFC]',
      isActive: data.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    this.db.platforms.push(newPlat);
    this.saveToDisk();
    return newPlat;
  }

  public async updatePlatform(id: string, data: Partial<PlatformItem>): Promise<PlatformItem | null> {
    if (this.prisma) {
      try {
        const updated = await this.prisma.platform.update({
          where: { id },
          data: {
            name: data.name !== undefined ? data.name.trim() : undefined,
            shortName: data.shortName !== undefined ? data.shortName.trim() : undefined,
            slug: data.slug !== undefined ? data.slug.trim() : undefined,
            domains: data.domains !== undefined ? data.domains : undefined,
            badgeBg: data.badgeBg !== undefined ? data.badgeBg : undefined,
            badgeText: data.badgeText !== undefined ? data.badgeText : undefined,
            accentColor: data.accentColor !== undefined ? data.accentColor : undefined,
            borderColor: data.borderColor !== undefined ? data.borderColor : undefined,
            lightBg: data.lightBg !== undefined ? data.lightBg : undefined,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
          },
        });
        return mapPrismaPlatformToFrontend(updated);
      } catch (err) {
        return null;
      }
    }

    const plat = this.db.platforms.find((p) => p.id === id);
    if (!plat) return null;

    Object.assign(plat, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return plat;
  }

  // --- COUPONS ---
  public async getCoupons(activeOnly = true): Promise<Coupon[]> {
    if (this.prisma) {
      const rows = await this.prisma.coupon.findMany({
        where: activeOnly ? { isActive: true } : {},
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapPrismaCouponToFrontend);
    }
    return activeOnly ? this.db.coupons.filter((c) => c.isActive) : this.db.coupons;
  }

  public async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const id = data.id || `cupom-${Date.now()}`;
    const code = data.code?.trim().toUpperCase() || 'PROMO';
    const store = data.store?.trim() || 'Loja Parceira';
    const discount = data.discount?.trim() || 'Desconto Especial';
    const now = new Date().toISOString();

    if (this.prisma) {
      const created = await this.prisma.coupon.create({
        data: {
          id,
          code,
          store,
          platformId: data.platform || null,
          description: data.description?.trim() || null,
          discount,
          minimumSpend: Number(data.minimumSpend) || 0,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          validFrom: data.validFrom ? new Date(data.validFrom) : null,
          affiliateUrl: data.affiliateUrl?.trim() || null,
          copyCount: 0,
          badge: data.badge || 'Verificado',
          isActive: data.isActive !== false,
          isFeatured: Boolean(data.isFeatured),
        },
      });
      return mapPrismaCouponToFrontend(created);
    }

    const newCoupon: Coupon = {
      id,
      code,
      store,
      platform: data.platform,
      description: data.description?.trim(),
      discount,
      minimumSpend: Number(data.minimumSpend) || 0,
      validUntil: data.validUntil,
      validFrom: data.validFrom,
      affiliateUrl: data.affiliateUrl?.trim(),
      copyCount: 0,
      badge: data.badge || 'Verificado',
      isActive: data.isActive !== false,
      isFeatured: Boolean(data.isFeatured),
      createdAt: now,
      updatedAt: now,
    };

    this.db.coupons.unshift(newCoupon);
    this.saveToDisk();
    return newCoupon;
  }

  public async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | null> {
    if (this.prisma) {
      try {
        const updated = await this.prisma.coupon.update({
          where: { id },
          data: {
            code: data.code !== undefined ? data.code.trim().toUpperCase() : undefined,
            store: data.store !== undefined ? data.store.trim() : undefined,
            platformId: data.platform !== undefined ? data.platform || null : undefined,
            description: data.description !== undefined ? data.description.trim() || null : undefined,
            discount: data.discount !== undefined ? data.discount.trim() : undefined,
            minimumSpend: data.minimumSpend !== undefined ? Number(data.minimumSpend) : undefined,
            validUntil: data.validUntil !== undefined ? (data.validUntil ? new Date(data.validUntil) : null) : undefined,
            validFrom: data.validFrom !== undefined ? (data.validFrom ? new Date(data.validFrom) : null) : undefined,
            affiliateUrl: data.affiliateUrl !== undefined ? data.affiliateUrl.trim() || null : undefined,
            badge: data.badge !== undefined ? data.badge : undefined,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
            isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
          },
        });
        return mapPrismaCouponToFrontend(updated);
      } catch (err) {
        return null;
      }
    }

    const coupon = this.db.coupons.find((c) => c.id === id);
    if (!coupon) return null;

    Object.assign(coupon, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return coupon;
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    if (this.prisma) {
      try {
        await this.prisma.coupon.delete({ where: { id } });
        return true;
      } catch (err) {
        return false;
      }
    }

    const index = this.db.coupons.findIndex((c) => c.id === id);
    if (index === -1) return false;

    this.db.coupons.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  // --- CLICK TRACKING ---
  public async trackClick(
    productId: string,
    platformName?: string,
    meta?: { ip?: string; userAgent?: string; referrer?: string }
  ): Promise<{ success: boolean; clicksCount: number }> {
    const hashedIp = meta?.ip ? hashClientIp(meta.ip) : undefined;
    const now = new Date();

    if (this.prisma) {
      try {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
          return { success: false, clicksCount: 0 };
        }

        const resolvedPlatform = platformName || product.platformId || 'other';

        // Register event and increment click
        await this.prisma.clickEvent.create({
          data: {
            id: `clk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            productId: product.id,
            platform: resolvedPlatform,
            productTitle: product.title,
            visitorIpHash: hashedIp || null,
            userAgent: meta?.userAgent ? meta.userAgent.slice(0, 255) : null,
            referrer: meta?.referrer ? meta.referrer.slice(0, 255) : null,
            timestamp: now,
          },
        });

        const updated = await this.prisma.product.update({
          where: { id: productId },
          data: { clicksCount: { increment: 1 } },
        });

        return { success: true, clicksCount: updated.clicksCount };
      } catch (err) {
        console.error('[DB TRACK CLICK ERROR]', err);
        return { success: false, clicksCount: 0 };
      }
    }

    // JSON fallback
    const product = this.db.products.find((p) => p.id === productId);
    if (product) {
      product.clicksCount = (product.clicksCount || 0) + 1;
    }

    const resolvedPlatform = platformName || product?.platform || 'other';

    this.db.clicks.push({
      id: `clk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId,
      productTitle: product?.title || 'Produto',
      platform: resolvedPlatform,
      visitorIpHash: hashedIp,
      userAgent: meta?.userAgent?.slice(0, 255),
      referrer: meta?.referrer?.slice(0, 255),
      timestamp: now.toISOString(),
    });

    this.saveToDisk();
    return {
      success: true,
      clicksCount: product?.clicksCount || 1,
    };
  }

  // --- ANALYTICS ---
  public async getAnalytics(): Promise<AnalyticsData> {
    if (this.prisma) {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

      const [
        totalProducts,
        activeProducts,
        inactiveProducts,
        featuredProducts,
        productsWithCoupon,
        totalClicks,
        clicksToday,
        clicksLast7Days,
        clicksLast30Days,
        topProductsRows,
        platforms,
        categories,
        allClicks,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({ where: { isActive: false } }),
        this.prisma.product.count({
          where: { OR: [{ isFeatured: true }, { isGoldFind: true }, { isWeeklyHighlight: true }] },
        }),
        this.prisma.product.count({ where: { couponCode: { not: null } } }),
        this.prisma.clickEvent.count(),
        this.prisma.clickEvent.count({ where: { timestamp: { gte: oneDayAgo } } }),
        this.prisma.clickEvent.count({ where: { timestamp: { gte: sevenDaysAgo } } }),
        this.prisma.clickEvent.count({ where: { timestamp: { gte: thirtyDaysAgo } } }),
        this.prisma.product.findMany({
          orderBy: { clicksCount: 'desc' },
          take: 8,
        }),
        this.prisma.platform.findMany(),
        this.prisma.category.findMany(),
        this.prisma.clickEvent.findMany({
          where: { timestamp: { gte: sevenDaysAgo } },
          select: { platform: true, productId: true, timestamp: true },
        }),
      ]);

      const topProducts = topProductsRows.map((p) => ({
        id: p.id,
        title: p.title,
        imageUrl: p.imageUrl,
        platform: p.platformId,
        price: p.price,
        clicks: p.clicksCount,
      }));

      const platformStats = await Promise.all(
        platforms.map(async (plat) => {
          const productCount = await this.prisma!.product.count({ where: { platformId: plat.id } });
          const clicks = await this.prisma!.clickEvent.count({ where: { platform: plat.id } });
          return {
            platform: plat.id,
            name: plat.name,
            productCount,
            clicks,
          };
        })
      );
      platformStats.sort((a, b) => b.clicks - a.clicks);

      const categoryStats = await Promise.all(
        categories.map(async (cat) => {
          const productCount = await this.prisma!.product.count({ where: { categoryId: cat.id } });
          // clicks on products with this categoryId
          const catProducts = await this.prisma!.product.findMany({
            where: { categoryId: cat.id },
            select: { id: true },
          });
          const catProductIds = catProducts.map((p) => p.id);
          const clicks = await this.prisma!.clickEvent.count({
            where: { productId: { in: catProductIds } },
          });
          return {
            category: cat.id,
            name: cat.name,
            productCount,
            clicks,
          };
        })
      );
      categoryStats.sort((a, b) => b.clicks - a.clicks);

      const dailyClicks: { date: string; clicks: number }[] = [];
      const nowMs = Date.now();
      const oneDayMs = 24 * 3600 * 1000;
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(nowMs - i * oneDayMs);
        const dateStr = dayDate.toISOString().split('T')[0];
        const count = allClicks.filter((c) => c.timestamp.toISOString().startsWith(dateStr)).length;
        dailyClicks.push({
          date: dateStr.slice(5),
          clicks: count,
        });
      }

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        featuredProducts,
        productsWithCoupon,
        totalClicks,
        clicksToday,
        clicksLast7Days,
        clicksLast30Days,
        topProducts,
        platformStats,
        categoryStats,
        dailyClicks,
      };
    }

    // JSON fallback
    const products = this.db.products;
    const clicks = this.db.clicks;
    const now = Date.now();
    const oneDayMs = 24 * 3600 * 1000;

    const clicksToday = clicks.filter((c) => now - new Date(c.timestamp).getTime() <= oneDayMs).length;
    const clicksLast7Days = clicks.filter((c) => now - new Date(c.timestamp).getTime() <= 7 * oneDayMs).length;
    const clicksLast30Days = clicks.filter((c) => now - new Date(c.timestamp).getTime() <= 30 * oneDayMs).length;

    const sortedProducts = [...products].sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0));
    const topProducts = sortedProducts.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.title,
      imageUrl: p.imageUrl,
      platform: p.platform,
      price: p.price,
      clicks: p.clicksCount || 0,
    }));

    const platformStats = this.db.platforms
      .map((plat) => {
        const platProducts = products.filter((p) => p.platform === plat.id);
        const platClicks = clicks.filter((c) => c.platform === plat.id).length;
        return {
          platform: plat.id,
          name: plat.name,
          productCount: platProducts.length,
          clicks: platClicks,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    const categoryStats = this.db.categories
      .map((cat) => {
        const catProducts = products.filter((p) => p.category === cat.id);
        const catProdIds = new Set(catProducts.map((p) => p.id));
        const catClicks = clicks.filter((c) => catProdIds.has(c.productId)).length;
        return {
          category: cat.id,
          name: cat.name,
          productCount: catProducts.length,
          clicks: catClicks,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    const dailyClicks: { date: string; clicks: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now - i * oneDayMs);
      const dateStr = dayDate.toISOString().split('T')[0];
      const count = clicks.filter((c) => c.timestamp.startsWith(dateStr)).length;
      dailyClicks.push({
        date: dateStr.slice(5),
        clicks: count,
      });
    }

    return {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive !== false).length,
      inactiveProducts: products.filter((p) => p.isActive === false).length,
      featuredProducts: products.filter((p) => p.isFeatured || p.isGoldFind || p.isWeeklyHighlight).length,
      productsWithCoupon: products.filter((p) => Boolean(p.couponCode)).length,
      totalClicks: clicks.length,
      clicksToday,
      clicksLast7Days,
      clicksLast30Days,
      topProducts,
      platformStats,
      categoryStats,
      dailyClicks,
    };
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<SiteSettings> {
    if (this.prisma) {
      const row = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
      if (row) {
        return {
          siteTitle: row.siteTitle,
          tagline: row.tagline,
          sinaraBio: row.sinaraBio,
          whatsappGroupUrl: row.whatsappGroupUrl || undefined,
          telegramChannelUrl: row.telegramChannelUrl || undefined,
          instagramUrl: row.instagramUrl || undefined,
          goldFindProductId: row.goldFindProductId || undefined,
          mainFeaturedId: row.mainFeaturedId || undefined,
          weeklyHighlightId: row.weeklyHighlightId || undefined,
        };
      }
    }
    return this.db.settings;
  }

  public async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    if (this.prisma) {
      const current = await this.getSettings();
      const merged = { ...current, ...data };
      const updated = await this.prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: {
          siteTitle: merged.siteTitle,
          tagline: merged.tagline,
          sinaraBio: merged.sinaraBio,
          whatsappGroupUrl: merged.whatsappGroupUrl || null,
          telegramChannelUrl: merged.telegramChannelUrl || null,
          instagramUrl: merged.instagramUrl || null,
          goldFindProductId: merged.goldFindProductId || null,
          mainFeaturedId: merged.mainFeaturedId || null,
          weeklyHighlightId: merged.weeklyHighlightId || null,
        },
        create: {
          id: 'default',
          siteTitle: merged.siteTitle,
          tagline: merged.tagline,
          sinaraBio: merged.sinaraBio,
          whatsappGroupUrl: merged.whatsappGroupUrl || null,
          telegramChannelUrl: merged.telegramChannelUrl || null,
          instagramUrl: merged.instagramUrl || null,
          goldFindProductId: merged.goldFindProductId || null,
          mainFeaturedId: merged.mainFeaturedId || null,
          weeklyHighlightId: merged.weeklyHighlightId || null,
        },
      });
      return {
        siteTitle: updated.siteTitle,
        tagline: updated.tagline,
        sinaraBio: updated.sinaraBio,
        whatsappGroupUrl: updated.whatsappGroupUrl || undefined,
        telegramChannelUrl: updated.telegramChannelUrl || undefined,
        instagramUrl: updated.instagramUrl || undefined,
        goldFindProductId: updated.goldFindProductId || undefined,
        mainFeaturedId: updated.mainFeaturedId || undefined,
        weeklyHighlightId: updated.weeklyHighlightId || undefined,
      };
    }

    this.db.settings = {
      ...this.db.settings,
      ...data,
    };
    this.saveToDisk();
    return this.db.settings;
  }

  public async resetDefaults(): Promise<void> {
    const defaults = getDefaultSchema();
    this.db = defaults;
    this.saveToDisk();

    if (this.prisma) {
      await this.prisma.clickEvent.deleteMany();
      await this.prisma.product.deleteMany();
      await this.prisma.coupon.deleteMany();
      await this.prisma.category.deleteMany();
      await this.prisma.platform.deleteMany();
      await this.prisma.siteSettings.deleteMany();
      await this.bootstrapPostgresIfNeeded();
    }
  }

  public async exportFullDatabase(): Promise<DatabaseSchema> {
    if (this.prisma) {
      const [products, categories, platforms, coupons, clicks, settings] = await Promise.all([
        this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.category.findMany({ orderBy: { order: 'asc' } }),
        this.prisma.platform.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.clickEvent.findMany({ orderBy: { timestamp: 'desc' }, take: 200 }),
        this.getSettings(),
      ]);

      return {
        products: products.map(mapPrismaProductToFrontend),
        categories: categories.map(mapPrismaCategoryToFrontend),
        platforms: platforms.map(mapPrismaPlatformToFrontend),
        coupons: coupons.map(mapPrismaCouponToFrontend),
        clicks: clicks.map((c) => ({
          id: c.id,
          productId: c.productId,
          productTitle: c.productTitle,
          platform: c.platform,
          visitorIpHash: c.visitorIpHash || undefined,
          userAgent: c.userAgent || undefined,
          referrer: c.referrer || undefined,
          timestamp: c.timestamp.toISOString(),
        })),
        settings,
        version: 2,
      };
    }

    return JSON.parse(JSON.stringify(this.db));
  }

  private async ensureCategoryAndPlatformExist(categoryId: string, platformId: string): Promise<void> {
    if (!this.prisma) return;

    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      const configCat = CATEGORIES_CONFIG.find((c) => c.id === categoryId);
      await this.prisma.category.create({
        data: {
          id: categoryId,
          name: configCat?.name || categoryId,
          slug: categoryId,
          icon: configCat?.icon || 'Tag',
          emoji: configCat?.emoji || '✨',
          order: 99,
          isActive: true,
        },
      });
    }

    const plat = await this.prisma.platform.findUnique({ where: { id: platformId } });
    if (!plat) {
      const configPlat = (PLATFORMS_CONFIG as any)[platformId];
      await this.prisma.platform.create({
        data: {
          id: platformId,
          name: configPlat?.name || platformId,
          shortName: configPlat?.shortName || platformId,
          slug: platformId,
          domains: configPlat?.urlDomains || [],
          badgeBg: configPlat?.badgeBg || 'bg-[#F1F5F9]',
          badgeText: configPlat?.badgeText || 'text-[#475569] font-bold',
          accentColor: configPlat?.accentColor || '#FF3B7F',
          borderColor: configPlat?.borderColor || 'border-[#E2E8F0]',
          lightBg: configPlat?.lightBg || 'bg-[#F8FAFC]',
          isActive: true,
        },
      });
    }
  }
}

export const dbService = new DatabaseService();
