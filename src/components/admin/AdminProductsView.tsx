import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  Ticket,
  MousePointerClick,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { Product, PlatformId } from '../../types';
import { formatBRL, PLATFORMS_CONFIG, CATEGORIES_CONFIG } from '../../utils/platformHelper';

interface AdminProductsViewProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleActive: (id: string) => Promise<void>;
  onToggleFeatured: (product: Product) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onToggleActive,
  onToggleFeatured,
  onDuplicate,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyCoupons, setOnlyCoupons] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'discount' | 'price_asc' | 'price_desc'>('recent');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          const matchesCode = p.couponCode?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCode) return false;
        }

        if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

        if (statusFilter === 'active' && p.isActive === false) return false;
        if (statusFilter === 'inactive' && p.isActive !== false) return false;

        if (onlyFeatured && !(p.isFeatured || p.isGoldFind || p.isWeeklyHighlight)) return false;
        if (onlyCoupons && !p.couponCode) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'clicks') {
          return (b.clicksCount || 0) - (a.clicksCount || 0);
        }
        if (sortBy === 'discount') {
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        }
        if (sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price_desc') {
          return b.price - a.price;
        }
        return 0;
      });
  }, [products, search, platformFilter, categoryFilter, statusFilter, onlyFeatured, onlyCoupons, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Catálogo de Produtos ({filteredProducts.length})
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie, filtre e audite todos os achadinhos cadastrados
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="px-4 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Achadinho</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cupom..."
              className="w-full pl-9 pr-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
            />
          </div>

          {/* Platform */}
          <div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
            >
              <option value="all">Todas as Plataformas</option>
              {Object.values(PLATFORMS_CONFIG).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES_CONFIG.filter((c) => c.id !== 'todos').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
            >
              <option value="recent">Mais Recentes</option>
              <option value="clicks">Mais Clicados</option>
              <option value="discount">Maior Desconto (%)</option>
              <option value="price_asc">Menor Preço (R$)</option>
              <option value="price_desc">Maior Preço (R$)</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-black uppercase text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-[#FF3B7F] text-white'
                : 'bg-[#FFF8FA] text-slate-600 hover:bg-[#FFE4E6]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FFF8FA] text-slate-600 hover:bg-[#FFE4E6]'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
              statusFilter === 'inactive'
                ? 'bg-slate-700 text-white'
                : 'bg-[#FFF8FA] text-slate-600 hover:bg-[#FFE4E6]'
            }`}
          >
            Inativos
          </button>

          <span className="text-slate-300 mx-1">|</span>

          <button
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              onlyFeatured
                ? 'bg-amber-500 text-white'
                : 'bg-[#FFF8FA] text-slate-600 hover:bg-[#FFE4E6]'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Só Destaques</span>
          </button>

          <button
            onClick={() => setOnlyCoupons(!onlyCoupons)}
            className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              onlyCoupons
                ? 'bg-[#4338CA] text-white'
                : 'bg-[#FFF8FA] text-slate-600 hover:bg-[#FFE4E6]'
            }`}
          >
            <Ticket className="w-3 h-3" />
            <span>Só com Cupom</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF8FA] border-b-2 border-[#FFE4E6] text-slate-500 font-black uppercase text-[10px]">
                <th className="p-4">Produto</th>
                <th className="p-4">Plataforma</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Destaque</th>
                <th className="p-4 text-center">Cliques</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFE4E6]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const platConfig = PLATFORMS_CONFIG[product.platform as PlatformId] || {
                    name: product.platform,
                    badgeBg: 'bg-slate-100',
                    badgeText: 'text-slate-700 font-bold',
                  };

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FFF8FA]/80 transition-colors group"
                    >
                      {/* Product details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[#FFE4E6] bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-[#2D1B22] line-clamp-1 group-hover:text-[#FF3B7F] transition-colors">
                              {product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.couponCode && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#E0E7FF] text-[#4338CA] flex items-center gap-0.5">
                                  <Ticket className="w-2.5 h-2.5" />
                                  {product.couponCode}
                                </span>
                              )}
                              {product.isGoldFind && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309]">
                                  👑 Ouro
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${platConfig.badgeBg} ${platConfig.badgeText}`}
                        >
                          {platConfig.name}
                        </span>
                      </td>

                      {/* Price & Discount */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-[#FF3B7F]">
                          {formatBRL(product.price)}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatBRL(product.originalPrice)}
                            <span className="ml-1 text-emerald-600 font-bold">
                              -{product.discountPercent}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4 whitespace-nowrap capitalize text-slate-600 font-medium">
                        {product.category}
                      </td>

                      {/* Active Status toggle */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleActive(product.id)}
                          title="Clique para alternar status"
                          className="cursor-pointer"
                        >
                          {product.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                              <XCircle className="w-3 h-3" /> Inativo
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Featured toggle */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleFeatured(product)}
                          title="Alternar destaque"
                          className="cursor-pointer p-1 rounded-lg hover:bg-[#FFE4E6] text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              product.isFeatured || product.isGoldFind
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Clicks */}
                      <td className="p-4 text-center whitespace-nowrap font-black text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-[#FFF8FA] px-2 py-0.5 rounded-md border border-[#FFE4E6]">
                          <MousePointerClick className="w-3 h-3 text-[#FF3B7F]" />
                          {product.clicksCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => window.open(product.affiliateUrl, '_blank')}
                            title="Testar Link de Afiliado"
                            className="p-1.5 rounded-xl text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditProduct(product)}
                            title="Editar Achadinho"
                            className="p-1.5 rounded-xl text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicate(product.id)}
                            title="Duplicar Produto"
                            className="p-1.5 rounded-xl text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteId(product.id)}
                            title="Excluir Produto"
                            className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              Excluir Achadinho?
            </h3>
            <p className="text-xs text-slate-600">
              Esta ação removerá o produto permanentemente do banco de dados e da vitrine.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
