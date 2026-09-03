import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db';
import { validateAdminCredentials, generateToken, requireAdminAuth } from './server/auth';
import { analyzeProductLink } from './server/linkAnalyzer';
import {
  securityHeaders,
  corsMiddleware,
  loginRateLimiter,
  linkAnalyzerRateLimiter,
  clickTrackingRateLimiter,
} from './server/security';
import { migrateFromJsonToPostgres } from './server/migration';

function getRouteParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security Headers & CORS
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // Body parser with 1mb limit (prevents memory DoS)
  app.use(express.json({ limit: '1mb' }));

  // --- HEALTH CHECK ---
  app.get('/api/health', async (req, res) => {
    const health = await dbService.checkHealth();
    res.json({
      status: health.healthy ? 'ok' : 'degraded',
      service: 'Sinara Achadinhos API',
      version: '2.0.0-production',
      database: health.engine,
      dbHealthy: health.healthy,
      timestamp: new Date().toISOString(),
      ...(health.error ? { dbError: health.error } : {}),
    });
  });

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', loginRateLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Informe usuário e senha.' });
      return;
    }

    const user = validateAdminCredentials(username, password);
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      success: true,
      user,
      token,
      message: 'Login realizado com sucesso!',
    });
  });

  app.get('/api/auth/me', requireAdminAuth, (req, res) => {
    const adminUser = (req as any).adminUser;
    res.json({
      authenticated: true,
      user: {
        username: adminUser.username,
        role: adminUser.role,
        name: 'Sinara (Administradora)',
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  });

  // --- PRODUCTS ROUTES ---
  // Public GET (with optional filters)
  app.get('/api/products', async (req, res) => {
    const activeOnly =
      req.query.activeOnly === 'true' || (req.query.activeOnly === undefined && req.query.all !== 'true');
    const category = req.query.category as string | undefined;
    const platform = req.query.platform as string | undefined;
    const featuredOnly = req.query.featured === 'true';
    const search = req.query.search as string | undefined;

    try {
      const products = await dbService.getProducts({
        activeOnly: req.query.all === 'true' ? false : activeOnly,
        category,
        platform,
        featuredOnly,
        search,
      });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao buscar produtos', details: err.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await dbService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao buscar produto', details: err.message });
    }
  });

  // Admin create product
  app.post('/api/products', requireAdminAuth, async (req, res) => {
    const { title, affiliateUrl, price } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'O título do produto é obrigatório.' });
      return;
    }
    if (!affiliateUrl || !affiliateUrl.trim()) {
      res.status(400).json({ error: 'O link de afiliado é obrigatório para direcionar os visitantes.' });
      return;
    }
    if (price === undefined || isNaN(Number(price))) {
      res.status(400).json({ error: 'Informe um preço válido.' });
      return;
    }

    try {
      const created = await dbService.createProduct(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao salvar produto.', details: err.message });
    }
  });

  // Admin update product
  app.put('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.updateProduct(getRouteParam(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar produto.', details: err.message });
    }
  });

  // Admin delete product
  app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
      const deleted = await dbService.deleteProduct(getRouteParam(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }
      res.json({ success: true, message: 'Produto excluído com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao excluir produto.', details: err.message });
    }
  });

  // Admin toggle active status
  app.patch('/api/products/:id/toggle-active', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.toggleProductActive(getRouteParam(req.params.id));
      if (!updated) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao alternar status do produto.', details: err.message });
    }
  });

  // Admin duplicate product
  app.post('/api/products/:id/duplicate', requireAdminAuth, async (req, res) => {
    try {
      const duplicated = await dbService.duplicateProduct(getRouteParam(req.params.id));
      if (!duplicated) {
        res.status(404).json({ error: 'Produto não encontrado para duplicação.' });
        return;
      }
      res.status(201).json(duplicated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao duplicar produto.', details: err.message });
    }
  });

  // --- LINK ANALYZER ROUTE ---
  app.post('/api/analyze-link', requireAdminAuth, linkAnalyzerRateLimiter, async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'A URL do produto é obrigatória.' });
      return;
    }

    try {
      const analysis = await analyzeProductLink(url);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({
        error: 'Erro ao analisar link.',
        details: err.message,
      });
    }
  });

  // --- CATEGORIES ROUTES ---
  app.get('/api/categories', async (req, res) => {
    const activeOnly = req.query.all !== 'true';
    try {
      const categories = await dbService.getCategories(activeOnly);
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao listar categorias.', details: err.message });
    }
  });

  app.post('/api/categories', requireAdminAuth, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      return;
    }
    try {
      const created = await dbService.createCategory(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao criar categoria.', details: err.message });
    }
  });

  app.put('/api/categories/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.updateCategory(getRouteParam(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Categoria não encontrada.' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar categoria.', details: err.message });
    }
  });

  app.delete('/api/categories/:id', requireAdminAuth, async (req, res) => {
    try {
      const result = await dbService.deleteCategory(getRouteParam(req.params.id));
      if (!result.success) {
        res.status(400).json({ error: result.message || 'Não foi possível excluir categoria.' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao excluir categoria.', details: err.message });
    }
  });

  // --- PLATFORMS ROUTES ---
  app.get('/api/platforms', async (req, res) => {
    const activeOnly = req.query.all !== 'true';
    try {
      const platforms = await dbService.getPlatforms(activeOnly);
      res.json(platforms);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao listar plataformas.', details: err.message });
    }
  });

  app.post('/api/platforms', requireAdminAuth, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'O nome da loja/plataforma é obrigatório.' });
      return;
    }
    try {
      const created = await dbService.createPlatform(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao criar plataforma.', details: err.message });
    }
  });

  app.put('/api/platforms/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.updatePlatform(getRouteParam(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Plataforma não encontrada.' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar plataforma.', details: err.message });
    }
  });

  // --- COUPONS ROUTES ---
  app.get('/api/coupons', async (req, res) => {
    const activeOnly = req.query.all !== 'true';
    try {
      const coupons = await dbService.getCoupons(activeOnly);
      res.json(coupons);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao listar cupons.', details: err.message });
    }
  });

  app.post('/api/coupons', requireAdminAuth, async (req, res) => {
    const { code, discount, store } = req.body;
    if (!code || !code.trim()) {
      res.status(400).json({ error: 'O código do cupom é obrigatório.' });
      return;
    }
    try {
      const created = await dbService.createCoupon(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao criar cupom.', details: err.message });
    }
  });

  app.put('/api/coupons/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.updateCoupon(getRouteParam(req.params.id), req.body);
      if (!updated) {
        res.status(404).json({ error: 'Cupom não encontrado.' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar cupom.', details: err.message });
    }
  });

  app.delete('/api/coupons/:id', requireAdminAuth, async (req, res) => {
    try {
      const deleted = await dbService.deleteCoupon(getRouteParam(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Cupom não encontrado.' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao excluir cupom.', details: err.message });
    }
  });

  // --- CLICK TRACKING ROUTE (Public, Fast, Non-Blocking) ---
  app.post('/api/track-click', clickTrackingRateLimiter, async (req, res) => {
    const { productId, platform } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'ID do produto é obrigatório.' });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || '';
    const referrer = (req.headers['referer'] as string) || '';

    try {
      const result = await dbService.trackClick(productId, platform, {
        ip,
        userAgent,
        referrer,
      });
      res.json(result);
    } catch (err: any) {
      res.json({ success: false, clicksCount: 0 });
    }
  });

  // --- ANALYTICS ROUTE (Admin) ---
  app.get('/api/analytics', requireAdminAuth, async (req, res) => {
    try {
      const analytics = await dbService.getAnalytics();
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao carregar métricas.', details: err.message });
    }
  });

  // --- SETTINGS ROUTES ---
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await dbService.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao carregar configurações.', details: err.message });
    }
  });

  app.put('/api/settings', requireAdminAuth, async (req, res) => {
    try {
      const updated = await dbService.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao salvar configurações.', details: err.message });
    }
  });

  // --- DATABASE & MIGRATION STATUS (Admin) ---
  app.get('/api/admin/database-status', requireAdminAuth, async (req, res) => {
    const isPostgresConfigured = dbService.isPostgres();
    try {
      const [products, categories, platforms, coupons, health] = await Promise.all([
        dbService.getProducts({ activeOnly: false }),
        dbService.getCategories(false),
        dbService.getPlatforms(false),
        dbService.getCoupons(false),
        dbService.checkHealth(),
      ]);
      res.json({
        isPostgresConfigured,
        currentStorage: isPostgresConfigured ? 'PostgreSQL (Prisma)' : 'JSON Disk (/data/database.json)',
        dbHealthy: health.healthy,
        productsCount: products.length,
        categoriesCount: categories.length,
        platformsCount: platforms.length,
        couponsCount: coupons.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao verificar banco', details: err.message });
    }
  });

  app.post('/api/admin/migrate-postgres', requireAdminAuth, async (req, res) => {
    const result = await migrateFromJsonToPostgres();
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  });

  // --- RESET DEFAULTS (Admin) ---
  app.post('/api/admin/reset-defaults', requireAdminAuth, async (req, res) => {
    try {
      await dbService.resetDefaults();
      res.json({
        success: true,
        message: 'Catálogo e configurações restaurados com sucesso!',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao resetar catálogo.', details: err.message });
    }
  });

  // --- CENTRALIZED ERROR HANDLING MIDDLEWARE ---
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[UNHANDLED SERVER ERROR]', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'production' ? 'Ocorreu um erro no processamento.' : err.message,
    });
  });

  // --- VITE MIDDLEWARE (Development) vs STATIC SERVE (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SINARA ACHADINHOS SERVER] Rodando na porta ${PORT}`);
    console.log(`[STATUS DO BANCO] ${dbService.isPostgres() ? 'PostgreSQL Ativo' : 'JSON Disk Ativo'}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL SERVER START ERROR]', err);
  process.exit(1);
});
