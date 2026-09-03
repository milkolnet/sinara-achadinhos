import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Heart,
  Ticket,
  Dices,
  PlusCircle,
  Menu,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenCoupons: () => void;
  onOpenSurprise: () => void;
  onOpenAdmin: () => void;
  totalProductsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  favoritesCount,
  onOpenFavorites,
  onOpenCoupons,
  onOpenSurprise,
  onOpenAdmin,
  totalProductsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-[#FF3B7F] shadow-sm transition-all">
      {/* Top micro banner with vibrant gradient */}
      <div className="bg-gradient-to-r from-[#FF3B7F] via-[#FF5E62] to-[#FF8A3B] text-white text-xs py-1.5 px-4 font-bold flex items-center justify-between text-center overflow-hidden">
        <div className="flex items-center gap-1.5 mx-auto animate-pulse">
          <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
          <span>
            <strong>Achadinhos da Sinara:</strong> Links 100% verificados e seguros hoje • Magalu, Mercado Livre, Shopee, Amazon & mais!
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Brand Identity with Vibrant Palette styled S-box */}
          <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#FF3B7F] rounded-2xl rotate-12 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#FF3B7F]/30 group-hover:rotate-0 transition-transform">
                S
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8A3B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF8A3B] text-[9px] font-bold text-white items-center justify-center">
                  ✨
                </span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-xl sm:text-2xl tracking-tight text-[#2D1B22] font-['Outfit']">
                  <span className="text-[#FF3B7F]">SINARA</span> ACHADINHOS
                </h1>
                <CheckCircle2 className="w-4 h-4 text-[#FF3B7F] fill-[#FFE4E6] hidden sm:inline" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-[#475569] flex items-center gap-1.5">
                <span>Garimpos & Ofertas Reais</span>
                <span className="w-1 h-1 rounded-full bg-[#FF3B7F]"></span>
                <span className="text-[#FF3B7F]">{totalProductsCount} achados</span>
              </p>
            </div>
          </div>

          {/* Quick Header Highlights from Vibrant Palette design */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="bg-[#FEE2E2] px-3.5 py-1.5 rounded-full text-[#FF3B7F] font-extrabold text-xs flex items-center gap-1 border border-[#FECDD3]">
              <span>🔥</span> PROMOS DO DIA
            </div>
            <div className="bg-[#F0FDFA] px-3.5 py-1.5 rounded-full text-[#0D9488] font-extrabold text-xs flex items-center gap-1 border border-[#CCFBF1]">
              <span>📦</span> FRETE GRÁTIS
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-input-desktop"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Busque por 'mini seladora', 'air fryer', 'shein'..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#FFF8FA] hover:bg-white focus:bg-white text-sm rounded-full border-2 border-[#FFE4E6] focus:border-[#FF3B7F] focus:ring-2 focus:ring-[#FF3B7F]/20 transition-all placeholder:text-slate-400 text-[#2D1B22] outline-hidden font-medium"
              />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Surprise wheel */}
            <button
              id="surprise-button-nav"
              onClick={onOpenSurprise}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#D97706] border-2 border-[#FED7AA] transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="Achadinho Surpresa do Dia"
            >
              <Dices className="w-4 h-4 text-[#D97706] animate-spin-slow" />
              <span className="hidden lg:inline">Achadinho Surpresa</span>
              <span className="lg:hidden text-xs">Surpresa 🎲</span>
            </button>

            {/* Coupons Vault */}
            <button
              id="coupons-button-nav"
              onClick={onOpenCoupons}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#FEE2E2] hover:bg-[#FFE4E6] text-[#FF3B7F] border-2 border-[#FECDD3] transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="Cofre de Cupons"
            >
              <Ticket className="w-4 h-4 text-[#FF3B7F]" />
              <span className="hidden sm:inline">Cupons</span>
              <span className="px-1.5 py-0.2 bg-[#FF3B7F] text-white rounded-full text-[10px] font-bold">
                6
              </span>
            </button>

            {/* Favorites Wishlist */}
            <button
              id="favorites-button-nav"
              onClick={onOpenFavorites}
              className="relative p-2 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] border-2 border-[#FFE4E6] transition-all active:scale-95 flex items-center gap-1.5"
              title="Meus Salvos"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-[#FF3B7F] fill-[#FF3B7F]' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Salvos</span>
              {favoritesCount > 0 && (
                <span className="bg-[#FF3B7F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Add / Manage Products Modal */}
            <button
              id="admin-button-nav"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-black bg-[#FF3B7F] hover:bg-[#E0266A] text-white shadow-md shadow-[#FF3B7F]/20 hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Adicionar Achadinho</span>
              <span className="md:hidden">Postar</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#FF3B7F] md:hidden rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-input-mobile"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar achadinhos (ex: Magalu, Air fryer...)"
              className="w-full pl-10 pr-9 py-2 bg-[#FFF8FA] text-sm rounded-full border-2 border-[#FFE4E6] focus:bg-white focus:border-[#FF3B7F] outline-hidden font-medium text-[#2D1B22]"
            />
            {searchQuery && (
              <button
                id="clear-search-button-mobile"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile drawer quick actions */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#FFE4E6] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              id="mobile-nav-surprise"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSurprise();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA] font-bold text-sm"
            >
              <Dices className="w-5 h-5 text-[#D97706]" />
              <span>Achadinho Surpresa do Dia 🎲</span>
            </button>

            <button
              id="mobile-nav-coupons"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCoupons();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FEE2E2] text-[#FF3B7F] border border-[#FECDD3] font-bold text-sm"
            >
              <Ticket className="w-5 h-5 text-[#FF3B7F]" />
              <span>Cofre de Cupons Ativos (Economize Agora) 🏷️</span>
            </button>

            <button
              id="mobile-nav-favorites"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFavorites();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FFF8FA] text-[#2D1B22] border border-[#FFE4E6] font-bold text-sm"
            >
              <Heart className="w-5 h-5 text-[#FF3B7F]" />
              <span>Meus Achadinhos Salvos ({favoritesCount}) ❤️</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
