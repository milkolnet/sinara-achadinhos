import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tag,
  Store,
  Ticket,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';
import { AdminUser } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'produtos'
  | 'adicionar'
  | 'categorias'
  | 'plataformas'
  | 'cupons'
  | 'destaques'
  | 'analytics'
  | 'configuracoes';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  onOpenStore: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  totalProductsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenStore,
  isMobileOpen,
  onCloseMobile,
  totalProductsCount,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: <Package className="w-4 h-4" />,
      badge: totalProductsCount,
    },
    { id: 'adicionar', label: 'Adicionar Produto', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'categorias', label: 'Categorias', icon: <Tag className="w-4 h-4" /> },
    { id: 'plataformas', label: 'Plataformas / Lojas', icon: <Store className="w-4 h-4" /> },
    { id: 'cupons', label: 'Cupons', icon: <Ticket className="w-4 h-4" /> },
    { id: 'destaques', label: 'Destaques', icon: <Star className="w-4 h-4" /> },
    { id: 'analytics', label: 'Cliques / Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r-2 border-[#FFE4E6] text-[#2D1B22]">
      {/* Brand Header */}
      <div className="p-5 border-b-2 border-[#FFE4E6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF3B7F] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#FF3B7F]/20 font-['Outfit']">
            S
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base font-['Outfit'] tracking-tight text-[#2D1B22]">
              <span className="text-[#FF3B7F]">SINARA</span> ADMIN
            </h2>
            <p className="text-[10px] font-bold text-slate-500">
              Painel de Controle
            </p>
          </div>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-[#FFE4E6] lg:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Info Bar */}
      <div className="px-5 py-3 bg-[#FFF8FA] border-b border-[#FFE4E6] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700 truncate max-w-[120px]">
            {currentUser.username}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFE4E6] text-[#FF3B7F]">
          {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF3B7F] text-white shadow-sm shadow-[#FF3B7F]/20'
                  : 'text-slate-700 hover:bg-[#FFF8FA] hover:text-[#FF3B7F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#FFE4E6] text-[#FF3B7F]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t-2 border-[#FFE4E6] space-y-2 bg-[#FFF8FA]">
        <button
          onClick={onOpenStore}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-[#FFE4E6] text-slate-700 hover:text-[#FF3B7F] hover:border-[#FF3B7F] text-xs font-black transition-all shadow-2xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver Vitrine Pública</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-[#FEE2E2] text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Sessão</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
