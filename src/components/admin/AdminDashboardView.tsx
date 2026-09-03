import React from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Star,
  Ticket,
  MousePointerClick,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Product, AnalyticsData } from '../../types';
import { formatBRL } from '../../utils/platformHelper';

interface AdminDashboardViewProps {
  products: Product[];
  analytics: AnalyticsData | null;
  onNavigateTab: (tab: any) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  analytics,
  onNavigateTab,
  onEditProduct,
}) => {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;
  const inactiveProducts = products.filter((p) => p.isActive === false).length;
  const featuredProducts = products.filter((p) => p.isFeatured || p.isGoldFind || p.isWeeklyHighlight).length;
  const withCoupon = products.filter((p) => Boolean(p.couponCode)).length;
  const totalClicks = analytics?.totalClicks || products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);

  // Top 5 products by clicks
  const topProducts = [...products]
    .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
    .slice(0, 5);

  // Latest added products
  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const dailyClicks = analytics?.dailyClicks || [];
  const maxDailyClicks = Math.max(...dailyClicks.map((d) => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FF3B7F] via-[#FF5E62] to-[#FF8A3B] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#FF3B7F]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              Painel Operacional
            </span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit']">
            Visão Geral dos Achadinhos
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl font-medium">
            Gerencie produtos de afiliados, acompanhe o engajamento de cliques em tempo real e mantenha a vitrine sempre atualizada.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('adicionar')}
          className="px-5 py-3 rounded-2xl bg-white text-[#FF3B7F] hover:bg-[#FFF8FA] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Adicionar Achadinho</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase">Total Produtos</span>
            <Package className="w-4 h-4 text-[#FF3B7F]" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            {totalProducts}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Cadastrados</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-black uppercase">Ativos</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-emerald-600">
            {activeProducts}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Na Vitrine</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase">Inativos</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-slate-400">
            {inactiveProducts}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Pausados</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-black uppercase">Destaques</span>
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-[#D97706]">
            {featuredProducts}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Topo & Selos</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4338CA]">
            <span className="text-[11px] font-black uppercase">Com Cupom</span>
            <Ticket className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-[#4338CA]">
            {withCoupon}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Descontos</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-[#FFE4E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#FF3B7F]">
            <span className="text-[11px] font-black uppercase">Cliques</span>
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-['Outfit'] text-[#FF3B7F]">
            {totalClicks}
          </div>
          <div className="text-[10px] font-bold text-slate-500">Para Lojas</div>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simple Interactive SVG/Bar Chart for Daily Clicks */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#2D1B22] flex items-center gap-2 font-['Outfit']">
                <TrendingUp className="w-4 h-4 text-[#FF3B7F]" />
                <span>Cliques Registrados (Últimos 7 dias)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visitantes direcionados para links de afiliados
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-black text-[#FF3B7F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-4 pb-2">
            <div className="flex items-end justify-between gap-2 h-44 border-b border-[#FFE4E6] px-2">
              {dailyClicks.map((item, idx) => {
                const heightPercent = Math.max(Math.round((item.clicks / maxDailyClicks) * 100), 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-black text-slate-600 group-hover:text-[#FF3B7F] transition-colors">
                      {item.clicks}
                    </span>
                    <div className="w-full bg-[#FFF8FA] rounded-t-xl h-36 flex items-end justify-center p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#FF3B7F] to-[#FF8A3B] rounded-t-lg transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#2D1B22] font-['Outfit']">
              Produtos por Plataforma
            </h3>
            <button
              onClick={() => onNavigateTab('plataformas')}
              className="text-xs font-black text-[#FF3B7F] hover:underline cursor-pointer"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-2.5">
            {analytics?.platformStats && analytics.platformStats.length > 0 ? (
              analytics.platformStats.slice(0, 5).map((stat) => (
                <div key={stat.platform} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#2D1B22]">{stat.name}</span>
                    <span className="text-slate-500">
                      {stat.productCount} achados • <strong className="text-[#FF3B7F]">{stat.clicks} cliques</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#FFF8FA] rounded-full overflow-hidden border border-[#FFE4E6]">
                    <div
                      style={{
                        width: `${Math.min(
                          Math.round((stat.productCount / Math.max(totalProducts, 1)) * 100),
                          100
                        )}%`,
                      }}
                      className="h-full bg-[#FF3B7F] rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Nenhuma estatística disponível.</p>
            )}
          </div>
        </div>
      </div>

      {/* Two Columns: Most Clicked vs Latest Added */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Clicked */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#2D1B22] font-['Outfit'] flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-[#FF3B7F]" />
              <span>Produtos Mais Clicados</span>
            </h3>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-black text-[#FF3B7F] hover:underline cursor-pointer"
            >
              Ver Todos
            </button>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onEditProduct(p)}
                className="p-2.5 rounded-2xl border border-[#FFE4E6] hover:border-[#FF3B7F] hover:bg-[#FFF8FA] transition-all flex items-center gap-3 cursor-pointer group"
              >
                <span className="w-6 h-6 rounded-xl bg-[#FFE4E6] text-[#FF3B7F] font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#FFE4E6] shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#2D1B22] truncate group-hover:text-[#FF3B7F] transition-colors">
                    {p.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-bold text-[#FF3B7F]">{formatBRL(p.price)}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-black">{p.platform}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#FF3B7F] bg-[#FFE4E6] px-2.5 py-1 rounded-xl">
                    {p.clicksCount || 0} cliques
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Added Products */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#2D1B22] font-['Outfit'] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF8A3B]" />
              <span>Últimos Produtos Cadastrados</span>
            </h3>
            <button
              onClick={() => onNavigateTab('produtos')}
              className="text-xs font-black text-[#FF3B7F] hover:underline cursor-pointer"
            >
              Ver Tabela Completa
            </button>
          </div>

          <div className="space-y-2.5">
            {latestProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onEditProduct(p)}
                className="p-2.5 rounded-2xl border border-[#FFE4E6] hover:border-[#FF3B7F] hover:bg-[#FFF8FA] transition-all flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#FFE4E6] shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#2D1B22] truncate group-hover:text-[#FF3B7F] transition-colors">
                    {p.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-bold text-[#FF3B7F]">{formatBRL(p.price)}</span>
                    <span>•</span>
                    <span className="text-[10px] font-semibold">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      p.isActive !== false
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.isActive !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
