import React, { useState, useEffect } from 'react';
import { Menu, PlusCircle, ExternalLink, Sparkles, Bell } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminProductsView } from './AdminProductsView';
import { AdminAddProductView } from './AdminAddProductView';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminPlatformsView } from './AdminPlatformsView';
import { AdminCouponsView } from './AdminCouponsView';
import { AdminHighlightsView } from './AdminHighlightsView';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { AdminSettingsView } from './AdminSettingsView';
import { Product, CategoryItem, PlatformItem, Coupon, AnalyticsData, SiteSettings, AdminUser } from '../../types';
import { api, authStorage } from '../../services/api';

interface AdminPortalProps {
  onBackToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Edit product state
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.authenticated) {
          setCurrentUser(res.user);
        }
      } catch {
        authStorage.clearToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch all admin data once authenticated
  const loadAllData = async () => {
    if (!currentUser) return;
    try {
      const [prodsData, catsData, platsData, coupsData, analData, settsData] = await Promise.all([
        api.getProducts({ all: true }),
        api.getCategories(true),
        api.getPlatforms(true),
        api.getCoupons(true),
        api.getAnalytics().catch(() => null),
        api.getSettings().catch(() => null),
      ]);

      setProducts(prodsData);
      setCategories(catsData);
      setPlatforms(platsData);
      setCoupons(coupsData);
      if (analData) setAnalytics(analData);
      if (settsData) setSettings(settsData);
    } catch (err) {
      console.error('[ADMIN] Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Handlers for products
  const handleToggleActive = async (id: string) => {
    try {
      const updated = await api.toggleProductActive(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleToggleFeatured = async (prod: Product) => {
    try {
      const updated = await api.updateProduct(prod.id, {
        isFeatured: !prod.isFeatured,
      });
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar destaque');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await api.duplicateProduct(id);
      setProducts((prev) => [duplicated, ...prev]);
      alert('Achadinho duplicado com sucesso! Você pode editá-lo agora.');
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir produto');
    }
  };

  const handleSaveProductSuccess = (saved: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
    setProductToEdit(null);
    setActiveTab('produtos');
  };

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setActiveTab('adicionar');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    onBackToStore();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFF8FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF3B7F] text-white flex items-center justify-center mx-auto animate-pulse font-black text-xl font-['Outfit']">
            S
          </div>
          <p className="text-xs font-bold text-slate-500">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  // Not logged in: show professional login form
  if (!currentUser) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => setCurrentUser(user)}
        onBackToStore={onBackToStore}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex text-[#2D1B22]">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'adicionar') {
            setProductToEdit(null);
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenStore={onBackToStore}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        totalProductsCount={products.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-[#FFE4E6] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl border border-[#FFE4E6] text-slate-700 hover:bg-[#FFF8FA] lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Painel Administrativo
              </span>
              <h1 className="text-sm font-black text-[#2D1B22] capitalize font-['Outfit']">
                {activeTab === 'adicionar' && productToEdit
                  ? 'Editar Achadinho'
                  : activeTab === 'adicionar'
                  ? 'Cadastrar Novo Achadinho'
                  : activeTab}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setProductToEdit(null);
                setActiveTab('adicionar');
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Achadinho</span>
            </button>

            <button
              onClick={onBackToStore}
              className="px-3 py-2 rounded-xl bg-white border border-[#FFE4E6] hover:border-[#FF3B7F] text-slate-700 hover:text-[#FF3B7F] text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Vitrine</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              products={products}
              analytics={analytics}
              onNavigateTab={(tab) => {
                if (tab === 'adicionar') setProductToEdit(null);
                setActiveTab(tab);
              }}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'produtos' && (
            <AdminProductsView
              products={products}
              onAddProduct={() => {
                setProductToEdit(null);
                setActiveTab('adicionar');
              }}
              onEditProduct={handleEditProduct}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteProduct}
            />
          )}

          {activeTab === 'adicionar' && (
            <AdminAddProductView
              productToEdit={productToEdit}
              onSaveSuccess={handleSaveProductSuccess}
              onCancel={() => {
                setProductToEdit(null);
                setActiveTab('produtos');
              }}
            />
          )}

          {activeTab === 'categorias' && (
            <AdminCategoriesView
              categories={categories}
              onRefresh={async () => {
                const cats = await api.getCategories(true);
                setCategories(cats);
              }}
            />
          )}

          {activeTab === 'plataformas' && (
            <AdminPlatformsView
              platforms={platforms}
              onRefresh={async () => {
                const plats = await api.getPlatforms(true);
                setPlatforms(plats);
              }}
            />
          )}

          {activeTab === 'cupons' && (
            <AdminCouponsView
              coupons={coupons}
              onRefresh={async () => {
                const coups = await api.getCoupons(true);
                setCoupons(coups);
              }}
            />
          )}

          {activeTab === 'destaques' && (
            <AdminHighlightsView
              products={products}
              settings={settings}
              onRefreshProducts={async () => {
                const prods = await api.getProducts({ all: true });
                setProducts(prods);
              }}
              onRefreshSettings={async () => {
                const setts = await api.getSettings();
                setSettings(setts);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalyticsView analytics={analytics} products={products} />
          )}

          {activeTab === 'configuracoes' && (
            <AdminSettingsView
              settings={settings}
              products={products}
              onRefreshSettings={async () => {
                const setts = await api.getSettings();
                setSettings(setts);
              }}
              onRefreshAll={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
