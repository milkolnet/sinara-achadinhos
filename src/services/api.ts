import {
  Product,
  Coupon,
  CategoryItem,
  PlatformItem,
  AnalyticsData,
  SiteSettings,
  LinkAnalysisResult,
  AdminUser,
} from '../types';

const TOKEN_STORAGE_KEY = 'sinara_admin_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.error(e);
    }
  },
  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export const api = {
  // --- AUTH ---
  async login(username: string, password: string): Promise<{ success: boolean; user: AdminUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha no login' }));
      throw new Error(err.error || 'Credenciais inválidas');
    }

    const data = await res.json();
    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ authenticated: boolean; user: AdminUser }> {
    const res = await fetchWithAuth('/api/auth/me');
    if (!res.ok) {
      authStorage.clearToken();
      throw new Error('Sessão expirada');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  // --- PRODUCTS ---
  async getProducts(params?: { all?: boolean; category?: string; platform?: string; featured?: boolean; search?: string }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.all) searchParams.set('all', 'true');
    if (params?.category) searchParams.set('category', params.category);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const url = `/api/products${query ? `?${query}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Produto não encontrado');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao salvar produto' }));
      throw new Error(err.error || 'Erro ao criar produto');
    }
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao atualizar produto' }));
      throw new Error(err.error || 'Erro ao atualizar produto');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir produto');
  },

  async toggleProductActive(id: string): Promise<Product> {
    const res = await fetchWithAuth(`/api/products/${id}/toggle-active`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Erro ao alterar status');
    return res.json();
  },

  async duplicateProduct(id: string): Promise<Product> {
    const res = await fetchWithAuth(`/api/products/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erro ao duplicar produto');
    return res.json();
  },

  async analyzeLink(url: string): Promise<LinkAnalysisResult> {
    const res = await fetchWithAuth('/api/analyze-link', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao analisar link' }));
      throw new Error(err.error || 'Erro ao analisar link');
    }
    return res.json();
  },

  // --- CATEGORIES ---
  async getCategories(all = false): Promise<CategoryItem[]> {
    const res = await fetch(`/api/categories${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Falha ao carregar categorias');
    return res.json();
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetchWithAuth('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao criar categoria' }));
      throw new Error(err.error || 'Erro ao criar categoria');
    }
    return res.json();
  },

  async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetchWithAuth(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar categoria');
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao excluir categoria' }));
      throw new Error(err.error || 'Erro ao excluir categoria');
    }
  },

  // --- PLATFORMS ---
  async getPlatforms(all = false): Promise<PlatformItem[]> {
    const res = await fetch(`/api/platforms${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Falha ao carregar plataformas');
    return res.json();
  },

  async createPlatform(data: Partial<PlatformItem>): Promise<PlatformItem> {
    const res = await fetchWithAuth('/api/platforms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao criar plataforma');
    return res.json();
  },

  async updatePlatform(id: string, data: Partial<PlatformItem>): Promise<PlatformItem> {
    const res = await fetchWithAuth(`/api/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar plataforma');
    return res.json();
  },

  // --- COUPONS ---
  async getCoupons(all = false): Promise<Coupon[]> {
    const res = await fetch(`/api/coupons${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Falha ao carregar cupons');
    return res.json();
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const res = await fetchWithAuth('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao criar cupom');
    return res.json();
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const res = await fetchWithAuth(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar cupom');
    return res.json();
  },

  async deleteCoupon(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir cupom');
  },

  // --- CLICK TRACKING (Public, Reliable, Non-Blocking) ---
  async trackClick(productId: string, platform?: string): Promise<{ success: boolean; clicksCount: number }> {
    try {
      const payload = JSON.stringify({ productId, platform });

      // Prefer sendBeacon if supported to ensure reliable background delivery
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track-click', blob);
        return { success: true, clicksCount: 0 };
      }

      // Keepalive fetch prevents abort if user navigates or switches tabs
      const res = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
      if (res.ok) {
        return res.json();
      }
    } catch (e) {
      // Non-blocking: failures never disrupt the shopper's navigation
      console.warn('[CLICK TRACK] Telemetria não-bloqueante:', e);
    }
    return { success: false, clicksCount: 0 };
  },

  // --- ANALYTICS ---
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetchWithAuth('/api/analytics');
    if (!res.ok) throw new Error('Falha ao carregar métricas');
    return res.json();
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetchWithAuth('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar configurações');
    return res.json();
  },

  // --- RESET DEFAULTS ---
  async resetDefaults(): Promise<void> {
    const res = await fetchWithAuth('/api/admin/reset-defaults', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Falha ao restaurar catálogo');
  },

  // --- DATABASE & MIGRATION ---
  async getDatabaseStatus(): Promise<{
    isPostgresConfigured: boolean;
    currentStorage: string;
    productsCount: number;
    categoriesCount: number;
    platformsCount: number;
    couponsCount: number;
  }> {
    const res = await fetchWithAuth('/api/admin/database-status');
    if (!res.ok) throw new Error('Falha ao obter status do banco');
    return res.json();
  },

  async migrateToPostgres(): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth('/api/admin/migrate-postgres', {
      method: 'POST',
    });
    return res.json();
  },
};
