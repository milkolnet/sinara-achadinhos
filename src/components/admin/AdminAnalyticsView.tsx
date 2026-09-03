import React from 'react';
import {
  MousePointerClick,
  TrendingUp,
  Calendar,
  Store,
  Tag,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { AnalyticsData, Product } from '../../types';
import { formatBRL, PLATFORMS_CONFIG } from '../../utils/platformHelper';

interface AdminAnalyticsViewProps {
  analytics: AnalyticsData | null;
  products: Product[];
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ analytics, products }) => {
  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Carregando métricas de engajamento...
      </div>
    );
  }

  const maxDaily = Math.max(...analytics.dailyClicks.map((d) => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
          Analytics & Rastreamento de Cliques
        </h2>
        <p className="text-xs text-slate-500">
          Dados em tempo real sobre o tráfego enviado para as lojas parceiras
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#FF3B7F]">
            <span className="text-xs font-black uppercase tracking-wider">Cliques Hoje</span>
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#2D1B22]">
            {analytics.clicksToday}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Últimas 24 horas</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-black uppercase tracking-wider">Últimos 7 Dias</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-emerald-600">
            {analytics.clicksLast7Days}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Tráfego semanal</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#4338CA]">
            <span className="text-xs font-black uppercase tracking-wider">Últimos 30 Dias</span>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#4338CA]">
            {analytics.clicksLast30Days}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Tráfego mensal</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#D97706]">
            <span className="text-xs font-black uppercase tracking-wider">Total Histórico</span>
            <Store className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black font-['Outfit'] text-[#D97706]">
            {analytics.totalClicks}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Cliques acumulados</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
        <h3 className="font-black text-base text-[#2D1B22] font-['Outfit'] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#FF3B7F]" />
          <span>Cliques por Dia (Últimos 7 Dias)</span>
        </h3>

        <div className="pt-6 pb-2">
          <div className="flex items-end justify-between gap-3 h-52 border-b border-[#FFE4E6] px-4">
            {analytics.dailyClicks.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.clicks / maxDaily) * 100), 10);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs font-black text-slate-700 group-hover:text-[#FF3B7F]">
                    {item.clicks}
                  </span>
                  <div className="w-full bg-[#FFF8FA] rounded-t-xl h-44 flex items-end justify-center p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-[#FF3B7F] to-[#FF8A3B] rounded-t-lg transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two columns: Top Products vs Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clicked Products */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-base text-[#2D1B22] font-['Outfit'] flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#FF3B7F]" />
            <span>Top Produtos com Mais Cliques</span>
          </h3>

          <div className="space-y-3">
            {analytics.topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl border border-[#FFE4E6] flex items-center gap-3"
              >
                <span className="w-7 h-7 rounded-xl bg-[#FFE4E6] text-[#FF3B7F] font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#FFE4E6] bg-white shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#2D1B22] truncate">{p.title}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-bold text-[#FF3B7F]">{formatBRL(p.price)}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-bold">{p.platform}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#FF3B7F] bg-[#FFE4E6] px-3 py-1 rounded-xl">
                    {p.clicks} cliques
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-base text-[#2D1B22] font-['Outfit'] flex items-center gap-2">
            <Store className="w-4 h-4 text-[#FF8A3B]" />
            <span>Desempenho por Plataforma</span>
          </h3>

          <div className="space-y-4">
            {analytics.platformStats.map((plat) => {
              const share = analytics.totalClicks > 0 ? Math.round((plat.clicks / analytics.totalClicks) * 100) : 0;
              return (
                <div key={plat.platform} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#2D1B22]">{plat.name}</span>
                    <span className="text-slate-600">
                      <strong className="text-[#FF3B7F] font-black">{plat.clicks} cliques</strong> ({share}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#FFF8FA] rounded-full overflow-hidden border border-[#FFE4E6]">
                    <div
                      style={{ width: `${share}%` }}
                      className="h-full bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
