import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  TrendingUp,
  Search,
  ExternalLink,
  Flame,
  ArrowUp,
  SlidersHorizontal,
  PackageOpen,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, FilterState, Coupon } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { SurpriseWheelModal } from './components/SurpriseWheelModal';
import { CouponsVaultModal } from './components/CouponsVaultModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ShareModal } from './components/ShareModal';
import { AdminManageModal } from './components/AdminManageModal';
import { VipCommunityModal } from './components/VipCommunityModal';
import { ToastNotification } from './components/ToastNotification';
import { PLATFORMS_CONFIG } from './utils/platformHelper';
import { AdminPortal } from './components/admin/AdminPortal';
import { api } from './services/api';

export default function App() {
  // Navigation View State: 'store' | 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin')
        ? 'admin'
        : 'store';
    }
    return 'store';
  });

  // Listen to browser forward/backward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin =
        window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');
      setCurrentView(isAdmin ? 'admin' : 'store');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (view: 'store' | 'admin') => {
    setCurrentView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Products state (persisted in localStorage if modified or loaded from API)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sinara_achadinhos_products');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('sinara_achadinhos_coupons');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COUPONS;
  });

  // Load latest real products and coupons from API on mount and when returning to store
  const refreshPublicData = async () => {
    try {
      const [apiProds, apiCoups] = await Promise.all([
        api.getProducts().catch(() => null),
        api.getCoupons().catch(() => null),
      ]);
      if (apiProds && apiProds.length > 0) {
        setProducts(apiProds);
      }
      if (apiCoups && apiCoups.length > 0) {
        setCoupons(apiCoups);
      }
    } catch (err) {
      console.warn('[STORE] Usando dados locais pré-carregados:', err);
    }
  };

  useEffect(() => {
    refreshPublicData();
  }, [currentView]);

  // Favorites / Wishlist IDs
  const [favoritesIds, setFavoritesIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sinara_achadinhos_favorites');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return ['prod-1', 'prod-3'];
  });

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'todos',
    platform: 'todas',
    priceMax: null,
    selectedTag: 'todos',
    sortBy: 'popular',
    onlyWithCoupon: false,
    onlySinaraTested: false,
    onlyFreeShipping: false,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVipOpen, setIsVipOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sinara_achadinhos_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('sinara_achadinhos_favorites', JSON.stringify(favoritesIds));
    } catch (e) {
      console.error(e);
    }
  }, [favoritesIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setFavoritesIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Achadinho removido dos seus salvos 💔');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Achadinho salvo com sucesso na sua lista! ❤️');
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
        return [...prev, id];
      }
    });
  };

  const handleTrackClick = (id: string) => {
    // Send click event to backend API for analytics
    api.trackClick(id).catch(() => {});
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, clicksCount: (p.clicksCount || 0) + 1 } : p))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Novo achadinho publicado com sucesso! ✨');
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast('Achadinho atualizado com sucesso! ✅');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Achadinho removido.');
  };

  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCoupons(INITIAL_COUPONS);
    showToast('Catálogo padrão restaurado com sucesso! 🔄');
  };

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(query);
          const matchesDesc = p.description.toLowerCase().includes(query);
          const matchesReview = p.sinaraReview?.toLowerCase().includes(query);
          const matchesPlatform = p.platform.toLowerCase().includes(query);
          const matchesCoupon = p.couponCode?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesDesc && !matchesReview && !matchesPlatform && !matchesCoupon) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'todos' && p.category !== filters.category) {
          return false;
        }

        // Platform
        if (filters.platform !== 'todas' && p.platform !== filters.platform) {
          return false;
        }

        // Tag
        if (filters.selectedTag !== 'todos' && !p.badges.includes(filters.selectedTag)) {
          return false;
        }

        // Price max
        if (filters.priceMax && p.price > filters.priceMax) {
          return false;
        }

        // Only with coupon
        if (filters.onlyWithCoupon && !p.couponCode) {
          return false;
        }

        // Only Sinara tested
        if (filters.onlySinaraTested && !p.badges.includes('testado_sinara')) {
          return false;
        }

        // Only free shipping
        if (filters.onlyFreeShipping && !p.badges.includes('frete_gratis')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'desconto') {
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        }
        if (filters.sortBy === 'menor_preco') {
          return a.price - b.price;
        }
        if (filters.sortBy === 'recentes') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // default: popular (likes + clicks)
        return (b.clicksCount + b.likesCount * 2) - (a.clicksCount + a.likesCount * 2);
      });
  }, [products, filters]);

  const featuredProduct = useMemo(() => {
    return products.find((p) => p.isFeatured) || products[0];
  }, [products]);

  const favoritesProductsList = useMemo(() => {
    return products.filter((p) => favoritesIds.includes(p.id));
  }, [products, favoritesIds]);

  // If currently in Admin view, render the dedicated Admin Portal
  if (currentView === 'admin') {
    return <AdminPortal onBackToStore={() => navigateTo('store')} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#2D1B22]">
      {/* Header & Navigation */}
      <Navbar
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        favoritesCount={favoritesIds.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCoupons={() => setIsCouponsOpen(true)}
        onOpenSurprise={() => setIsSurpriseOpen(true)}
        onOpenAdmin={() => navigateTo('admin')}
        totalProductsCount={products.length}
      />

      {/* Hero with Sinara Identity and Highlight */}
      <HeroSection
        featuredProduct={featuredProduct}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenSurprise={() => setIsSurpriseOpen(true)}
        onOpenCoupons={() => setIsCouponsOpen(true)}
        onOpenCommunity={() => setIsVipOpen(true)}
      />

      {/* Filter and Category Sticky Tabs */}
      <FilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onResetFilters={() =>
          setFilters({
            searchQuery: '',
            category: 'todos',
            platform: 'todas',
            priceMax: null,
            selectedTag: 'todos',
            sortBy: 'popular',
            onlyWithCoupon: false,
            onlySinaraTested: false,
            onlyFreeShipping: false,
          })
        }
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((curr) => (curr === 'grid' ? 'list' : 'grid'))}
        totalFilteredCount={filteredProducts.length}
      />

      {/* Main Achadinhos Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-[#FFE4E6] shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FFE4E6] text-[#FF3B7F] flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="font-black text-[#2D1B22] text-lg mb-1">
              Nenhum achadinho encontrado
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Tente buscar com outras palavras ou limpe os filtros para ver todos os achados da Sinara.
            </p>
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  category: 'todos',
                  platform: 'todas',
                  priceMax: null,
                  selectedTag: 'todos',
                  sortBy: 'popular',
                  onlyWithCoupon: false,
                  onlySinaraTested: false,
                  onlyFreeShipping: false,
                })
              }
              className="px-6 py-3 rounded-2xl bg-[#FF3B7F] hover:bg-[#E0266A] text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Ver Todos os Achadinhos ✨
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-4 max-w-4xl mx-auto'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoritesIds.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={(p) => setSelectedProduct(p)}
                onOpenShare={(p) => setShareProduct(p)}
                onTrackClick={handleTrackClick}
                onCopyCouponSuccess={(code) =>
                  showToast(`Cupom ${code} copiado! Use no checkout da loja 🏷️`)
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Action on Mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 sm:hidden flex items-center gap-2 bg-[#2D1B22] text-white px-5 py-3 rounded-full shadow-2xl border-2 border-[#FF3B7F]">
        <button
          onClick={() => setIsSurpriseOpen(true)}
          className="flex items-center gap-1.5 text-xs font-black text-[#FF8A3B] px-2"
        >
          <span>🎲</span>
          <span>Surpresa</span>
        </button>
        <div className="w-px h-4 bg-white/20" />
        <button
          onClick={() => setIsCouponsOpen(true)}
          className="flex items-center gap-1.5 text-xs font-black text-[#FF3B7F] px-2"
        >
          <span>🏷️</span>
          <span>Cupons</span>
        </button>
        <div className="w-px h-4 bg-white/20" />
        <button
          onClick={() => navigateTo('admin')}
          className="flex items-center gap-1.5 text-xs font-black text-white px-2"
        >
          <span>➕</span>
          <span>Postar</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-[#FF3B7F] pt-12 pb-16 sm:pb-12 text-[#2D1B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#FF3B7F] flex items-center justify-center text-white font-black text-base shadow-md shadow-[#FF3B7F]/30">
                  S
                </div>
                <span className="font-black text-xl text-[#2D1B22] font-['Outfit']">
                  <span className="text-[#FF3B7F]">SINARA</span> ACHADINHOS
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
                Curadoria independente de achadinhos, novidades virais e descontos reais nas maiores lojas do Brasil. Os preços e a disponibilidade dos produtos podem sofrer alterações pelas lojas oficiais sem aviso prévio.
              </p>
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {Object.values(PLATFORMS_CONFIG).map((plat) => (
                  <span
                    key={plat.id}
                    className={`text-[10px] px-2.5 py-0.5 rounded-lg font-black ${plat.badgeBg} ${plat.badgeText}`}
                  >
                    {plat.shortName}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-black text-[#2D1B22] uppercase tracking-wider text-[11px]">
                Navegação Rápida
              </h4>
              <ul className="space-y-1.5 font-bold text-slate-600">
                <li>
                  <button onClick={() => setIsSurpriseOpen(true)} className="hover:text-[#FF3B7F] transition-colors">
                    🎲 Roleta da Sorte
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCouponsOpen(true)} className="hover:text-[#FF3B7F] transition-colors">
                    🏷️ Cofre de Cupons
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsFavoritesOpen(true)} className="hover:text-[#FF3B7F] transition-colors">
                    ❤️ Meus Salvos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('admin')} className="hover:text-[#FF3B7F] transition-colors">
                    ⚙️ Painel Admin
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-black text-[#2D1B22] uppercase tracking-wider text-[11px]">
                Comunidade & Dúvidas
              </h4>
              <p className="text-slate-600 font-medium">
                Quer sugerir um achadinho ou fazer parceria com a Sinara?
              </p>
              <button
                onClick={() => setIsVipOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D9488] text-white font-extrabold shadow-sm hover:bg-[#0F766E] transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white fill-white" />
                <span>Canal VIP no Zap</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#FFE4E6] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
            <div>
              © {new Date().getFullYear()} Sinara Achadinhos da Internet • Feito com amor e economia 💕
            </div>
            <div className="flex items-center gap-4 font-bold text-slate-700">
              <span>Mercado Livre</span>
              <span>•</span>
              <span>Magalu</span>
              <span>•</span>
              <span>Shopee</span>
              <span>•</span>
              <span>Amazon</span>
              <span>•</span>
              <span>Shein</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={selectedProduct ? favoritesIds.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenShare={(p) => setShareProduct(p)}
        onTrackClick={handleTrackClick}
        onCopyCouponSuccess={(code) =>
          showToast(`Cupom ${code} copiado! Aproveite o desconto no checkout 🏷️`)
        }
      />

      <SurpriseWheelModal
        products={products}
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <CouponsVaultModal
        coupons={coupons}
        isOpen={isCouponsOpen}
        onClose={() => setIsCouponsOpen(false)}
        onCopyCouponSuccess={(code) =>
          showToast(`Cupom ${code} copiado! Use na loja oficial 🏷️`)
        }
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoritesProductsList}
        onRemoveFavorite={handleToggleFavorite}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onClearFavorites={() => {
          setFavoritesIds([]);
          showToast('Lista de salvos limpa!');
        }}
      />

      <ShareModal
        product={shareProduct}
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
      />

      <AdminManageModal
        products={products}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaults={handleResetDefaults}
      />

      <VipCommunityModal
        isOpen={isVipOpen}
        onClose={() => setIsVipOpen(false)}
      />

      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
