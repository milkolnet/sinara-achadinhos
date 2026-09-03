import React from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Truck,
  Flame,
  LayoutGrid,
  List,
} from 'lucide-react';
import { CategoryId, FilterState, PlatformId } from '../types';
import { CATEGORIES_CONFIG, PLATFORMS_CONFIG } from '../utils/platformHelper';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onToggleViewMode,
  totalFilteredCount,
}) => {
  const platformsList: (PlatformId | 'todas')[] = [
    'todas',
    'mercadolivre',
    'magalu',
    'shopee',
    'amazon',
    'shein',
    'aliexpress',
    'tiktok',
  ];

  const isFiltered =
    filters.category !== 'todos' ||
    filters.platform !== 'todas' ||
    filters.selectedTag !== 'todos' ||
    filters.priceMax !== null ||
    filters.onlyWithCoupon ||
    filters.onlySinaraTested ||
    filters.onlyFreeShipping ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white border-b-2 border-[#FFE4E6] sticky top-16 sm:top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* Category horizontal scrolling tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {CATEGORIES_CONFIG.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => onFilterChange({ category: cat.id as CategoryId })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all select-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF3B7F] text-white shadow-md shadow-[#FF3B7F]/25 scale-102'
                    : 'bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] border border-[#FFE4E6]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary row: Platforms Pills & Quick Switches & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#FFE4E6]/80">
          {/* Platforms selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar max-w-full">
            <span className="text-xs font-extrabold text-[#2D1B22] flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF3B7F]" />
              <span>Loja:</span>
            </span>

            {platformsList.map((pId) => {
              const isSelected = filters.platform === pId;
              const config = pId !== 'todas' ? PLATFORMS_CONFIG[pId] : null;

              return (
                <button
                  key={pId}
                  id={`platform-tab-${pId}`}
                  onClick={() => onFilterChange({ platform: pId })}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2D1B22] text-white shadow-xs'
                      : 'bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] border border-[#FFE4E6]'
                  }`}
                >
                  {pId === 'todas' ? 'Todas' : config?.shortName || pId}
                </button>
              );
            })}
          </div>

          {/* Quick Badges and Sort & View controls */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Sinara Tested quick toggle */}
            <button
              id="filter-tested-toggle"
              onClick={() => onFilterChange({ onlySinaraTested: !filters.onlySinaraTested })}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filters.onlySinaraTested
                  ? 'bg-[#FFE4E6] text-[#FF3B7F] border-2 border-[#FF3B7F]'
                  : 'bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] border border-[#FFE4E6]'
              }`}
            >
              <span>💖</span>
              <span className="hidden sm:inline">Testado pela Sinara</span>
              <span className="sm:hidden">Testados</span>
            </button>

            {/* Coupons only toggle */}
            <button
              id="filter-coupons-toggle"
              onClick={() => onFilterChange({ onlyWithCoupon: !filters.onlyWithCoupon })}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filters.onlyWithCoupon
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border-2 border-[#4F46E5]'
                  : 'bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] border border-[#FFE4E6]'
              }`}
            >
              <Tag className="w-3 h-3 text-[#4F46E5]" />
              <span>Com Cupom</span>
            </button>

            {/* Sort selector */}
            <div className="relative">
              <select
                id="sort-by-select"
                aria-label="Ordenar produtos por"
                value={filters.sortBy}
                onChange={(e) =>
                  onFilterChange({
                    sortBy: e.target.value as FilterState['sortBy'],
                  })
                }
                className="pl-3 pr-7 py-1 text-xs font-black bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] rounded-xl border border-[#FFE4E6] cursor-pointer focus:ring-2 focus:ring-[#FF3B7F] outline-hidden appearance-none"
              >
                <option value="popular">🔥 Mais Populares</option>
                <option value="desconto">📉 Maior Desconto</option>
                <option value="menor_preco">💰 Menor Preço</option>
                <option value="recentes">✨ Mais Recentes</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-[#FF3B7F] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View layout switcher (Grid / List) */}
            <button
              id="toggle-view-mode-button"
              onClick={onToggleViewMode}
              className="p-1.5 text-[#2D1B22] hover:text-[#FF3B7F] bg-[#FFF8FA] hover:bg-[#FFE4E6] border border-[#FFE4E6] rounded-xl transition-colors"
              title={viewMode === 'grid' ? 'Ver em Lista' : 'Ver em Grade'}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>

            {/* Reset button if filtered */}
            {isFiltered && (
              <button
                id="reset-filters-button"
                onClick={onResetFilters}
                className="text-xs font-extrabold text-[#FF3B7F] hover:text-[#E0266A] underline decoration-[#FF3B7F] px-1 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Counter and current tag display */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-medium">
          <div>
            Mostrando <strong className="text-[#FF3B7F]">{totalFilteredCount}</strong> achadinho{totalFilteredCount === 1 ? '' : 's'}
            {filters.category !== 'todos' && ` em ${CATEGORIES_CONFIG.find(c => c.id === filters.category)?.name}`}
            {filters.platform !== 'todas' && ` na ${PLATFORMS_CONFIG[filters.platform]?.name || filters.platform}`}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] text-slate-500">
              Dica: clique em <strong>"Garantir Oferta"</strong> para abrir o link oficial e seguro com desconto.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
