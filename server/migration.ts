import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { dbService } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

export async function migrateFromJsonToPostgres(): Promise<{
  success: boolean;
  message: string;
  stats?: {
    categories: number;
    platforms: number;
    products: number;
    coupons: number;
    clicks: number;
  };
}> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      success: false,
      message: 'DATABASE_URL não configurada no ambiente. A persistência continua ativa em /data/database.json.',
    };
  }

  // Ensure backup before migration
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
  const backupFile = path.join(
    BACKUPS_DIR,
    `pre_migration_backup_${Date.now()}.json`
  );
  const currentDb = await dbService.exportFullDatabase();
  fs.writeFileSync(backupFile, JSON.stringify(currentDb, null, 2), 'utf-8');
  console.log(`[MIGRATION] Snapshot de segurança salvo em: ${backupFile}`);

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('[MIGRATION] Conectado ao PostgreSQL com sucesso.');

    let categoriesCount = 0;
    let platformsCount = 0;
    let productsCount = 0;
    let couponsCount = 0;
    let clicksCount = 0;

    // 1. Migrate Categories
    for (const cat of currentDb.categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          emoji: cat.emoji,
          order: cat.order,
          isActive: cat.isActive,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          emoji: cat.emoji,
          order: cat.order,
          isActive: cat.isActive,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
        },
      });
      categoriesCount++;
    }

    // 2. Migrate Platforms
    for (const plat of currentDb.platforms) {
      await prisma.platform.upsert({
        where: { id: plat.id },
        update: {
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
          createdAt: plat.createdAt ? new Date(plat.createdAt) : new Date(),
        },
      });
      platformsCount++;
    }

    // 3. Migrate Products
    for (const prod of currentDb.products) {
      // Ensure platform and category exist before linking
      const catExists = currentDb.categories.some((c) => c.id === prod.category);
      const platExists = currentDb.platforms.some((p) => p.id === prod.platform);

      const targetCategoryId = catExists ? prod.category : currentDb.categories[0]?.id || 'casa';
      const targetPlatformId = platExists ? prod.platform : currentDb.platforms[0]?.id || 'other';

      await prisma.product.upsert({
        where: { id: prod.id },
        update: {
          title: prod.title,
          slug: prod.slug || prod.id,
          description: prod.description || '',
          sinaraReview: prod.sinaraReview || null,
          price: prod.price,
          originalPrice: prod.originalPrice,
          discountPercent: prod.discountPercent || 0,
          affiliateUrl: prod.affiliateUrl,
          originalUrl: prod.originalUrl || prod.affiliateUrl,
          resolvedUrl: prod.resolvedUrl || prod.affiliateUrl,
          platformUrl: prod.platformUrl || prod.affiliateUrl,
          imageUrl: prod.imageUrl,
          galleryImages: prod.galleryImages || [],
          platformId: targetPlatformId,
          categoryId: targetCategoryId,
          subcategory: prod.subcategory || null,
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
          installments: prod.installments || null,
        },
        create: {
          id: prod.id,
          title: prod.title,
          slug: prod.slug || prod.id,
          description: prod.description || '',
          sinaraReview: prod.sinaraReview || null,
          price: prod.price,
          originalPrice: prod.originalPrice,
          discountPercent: prod.discountPercent || 0,
          affiliateUrl: prod.affiliateUrl,
          originalUrl: prod.originalUrl || prod.affiliateUrl,
          resolvedUrl: prod.resolvedUrl || prod.affiliateUrl,
          platformUrl: prod.platformUrl || prod.affiliateUrl,
          imageUrl: prod.imageUrl,
          galleryImages: prod.galleryImages || [],
          platformId: targetPlatformId,
          categoryId: targetCategoryId,
          subcategory: prod.subcategory || null,
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
          installments: prod.installments || null,
          createdAt: prod.createdAt ? new Date(prod.createdAt) : new Date(),
        },
      });
      productsCount++;
    }

    // 4. Migrate Coupons
    for (const coup of currentDb.coupons) {
      await prisma.coupon.upsert({
        where: { id: coup.id },
        update: {
          code: coup.code,
          store: coup.store,
          platformId: coup.platform || null,
          description: coup.description || null,
          discount: coup.discount,
          minimumSpend: coup.minimumSpend || 0,
          validUntil: coup.validUntil ? new Date(coup.validUntil) : null,
          validFrom: coup.validFrom ? new Date(coup.validFrom) : null,
          affiliateUrl: coup.affiliateUrl || null,
          copyCount: coup.copyCount || 0,
          badge: coup.badge || 'Verificado',
          isActive: coup.isActive !== false,
          isFeatured: coup.isFeatured || false,
        },
        create: {
          id: coup.id,
          code: coup.code,
          store: coup.store,
          platformId: coup.platform || null,
          description: coup.description || null,
          discount: coup.discount,
          minimumSpend: coup.minimumSpend || 0,
          validUntil: coup.validUntil ? new Date(coup.validUntil) : null,
          validFrom: coup.validFrom ? new Date(coup.validFrom) : null,
          affiliateUrl: coup.affiliateUrl || null,
          copyCount: coup.copyCount || 0,
          badge: coup.badge || 'Verificado',
          isActive: coup.isActive !== false,
          isFeatured: coup.isFeatured || false,
          createdAt: coup.createdAt ? new Date(coup.createdAt) : new Date(),
        },
      });
      couponsCount++;
    }

    // 5. Migrate Clicks
    for (const clk of currentDb.clicks || []) {
      const prodExists = currentDb.products.some((p) => p.id === clk.productId);
      if (!prodExists) continue;
      await prisma.clickEvent.upsert({
        where: { id: clk.id },
        update: {
          platform: clk.platform,
          productTitle: clk.productTitle,
          visitorIpHash: clk.visitorIpHash || null,
          userAgent: clk.userAgent || null,
          referrer: clk.referrer || null,
        },
        create: {
          id: clk.id,
          productId: clk.productId,
          platform: clk.platform,
          productTitle: clk.productTitle,
          visitorIpHash: clk.visitorIpHash || null,
          userAgent: clk.userAgent || null,
          referrer: clk.referrer || null,
          timestamp: clk.timestamp ? new Date(clk.timestamp) : new Date(),
        },
      });
      clicksCount++;
    }

    // 6. Migrate SiteSettings
    if (currentDb.settings) {
      await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: {
          siteTitle: currentDb.settings.siteTitle,
          tagline: currentDb.settings.tagline,
          sinaraBio: currentDb.settings.sinaraBio,
          whatsappGroupUrl: currentDb.settings.whatsappGroupUrl || null,
          telegramChannelUrl: currentDb.settings.telegramChannelUrl || null,
          instagramUrl: currentDb.settings.instagramUrl || null,
          goldFindProductId: currentDb.settings.goldFindProductId || null,
          mainFeaturedId: currentDb.settings.mainFeaturedId || null,
          weeklyHighlightId: currentDb.settings.weeklyHighlightId || null,
        },
        create: {
          id: 'default',
          siteTitle: currentDb.settings.siteTitle,
          tagline: currentDb.settings.tagline,
          sinaraBio: currentDb.settings.sinaraBio,
          whatsappGroupUrl: currentDb.settings.whatsappGroupUrl || null,
          telegramChannelUrl: currentDb.settings.telegramChannelUrl || null,
          instagramUrl: currentDb.settings.instagramUrl || null,
          goldFindProductId: currentDb.settings.goldFindProductId || null,
          mainFeaturedId: currentDb.settings.mainFeaturedId || null,
          weeklyHighlightId: currentDb.settings.weeklyHighlightId || null,
        },
      });
    }

    console.log('[MIGRATION] Migração para PostgreSQL concluída com sucesso!');
    await prisma.$disconnect();

    return {
      success: true,
      message: 'Migração de dados para PostgreSQL concluída com integridade!',
      stats: {
        categories: categoriesCount,
        platforms: platformsCount,
        products: productsCount,
        coupons: couponsCount,
        clicks: clicksCount,
      },
    };
  } catch (err: any) {
    await prisma.$disconnect();
    console.error('[MIGRATION ERROR]', err);
    return {
      success: false,
      message: `Erro durante a migração para PostgreSQL: ${err.message}`,
    };
  }
}
