import React, { useState } from 'react';
import { Star, Crown, Sparkles, CheckCircle2, Package, Save } from 'lucide-react';
import { Product, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { formatBRL } from '../../utils/platformHelper';

interface AdminHighlightsViewProps {
  products: Product[];
  settings: SiteSettings | null;
  onRefreshProducts: () => Promise<void>;
  onRefreshSettings: () => Promise<void>;
}

export const AdminHighlightsView: React.FC<AdminHighlightsViewProps> = ({
  products,
  settings,
  onRefreshProducts,
  onRefreshSettings,
}) => {
  const activeProducts = products.filter((p) => p.isActive !== false);

  const [goldFindId, setGoldFindId] = useState(
    settings?.goldFindProductId || products.find((p) => p.isGoldFind)?.id || activeProducts[0]?.id || ''
  );
  const [mainFeaturedId, setMainFeaturedId] = useState(
    settings?.mainFeaturedId || products.find((p) => p.isFeatured)?.id || activeProducts[0]?.id || ''
  );
  const [weeklyHighlightId, setWeeklyHighlightId] = useState(
    settings?.weeklyHighlightId || products.find((p) => p.isWeeklyHighlight)?.id || activeProducts[1]?.id || ''
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedGoldProduct = products.find((p) => p.id === goldFindId);
  const selectedMainFeatured = products.find((p) => p.id === mainFeaturedId);
  const selectedWeekly = products.find((p) => p.id === weeklyHighlightId);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Update site settings
      await api.updateSettings({
        goldFindProductId: goldFindId,
        mainFeaturedId,
        weeklyHighlightId,
      });

      // 2. Synchronize product flags
      for (const prod of products) {
        const isGold = prod.id === goldFindId;
        const isFeat = prod.id === mainFeaturedId;
        const isWeekly = prod.id === weeklyHighlightId;

        if (prod.isGoldFind !== isGold || prod.isFeatured !== isFeat || prod.isWeeklyHighlight !== isWeekly) {
          await api.updateProduct(prod.id, {
            isGoldFind: isGold,
            isFeatured: isFeat,
            isWeeklyHighlight: isWeekly,
          });
        }
      }

      await onRefreshProducts();
      await onRefreshSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar destaques');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Curadoria de Destaques
          </h2>
          <p className="text-xs text-slate-500">
            Defina quais produtos ocupam as posições mais nobres e visadas na vitrine
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Destaques'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Destaques atualizados com sucesso na vitrine pública!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section 1: Achadinho de Ouro */}
        <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
                  Achadinho de Ouro
                </h3>
                <p className="text-[10px] text-slate-500">Barra de topo com badge dourado</p>
              </div>
            </div>

            <select
              value={goldFindId}
              onChange={(e) => setGoldFindId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} - {formatBRL(p.price)}
                </option>
              ))}
            </select>

            {selectedGoldProduct && (
              <div className="p-3 rounded-2xl bg-[#FEF9C3]/50 border border-[#FEF08A] space-y-2">
                <img
                  src={selectedGoldProduct.imageUrl}
                  alt={selectedGoldProduct.title}
                  className="w-full h-32 object-cover rounded-xl border border-[#FDE68A] bg-white"
                />
                <h4 className="font-bold text-xs text-[#2D1B22] line-clamp-2">
                  {selectedGoldProduct.title}
                </h4>
                <div className="text-xs font-black text-[#B45309]">
                  {formatBRL(selectedGoldProduct.price)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Destaque Principal / Hero */}
        <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFE4E6] text-[#FF3B7F] flex items-center justify-center font-black">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
                  Oferta em Destaque
                </h3>
                <p className="text-[10px] text-slate-500">Primeiro card em destaque</p>
              </div>
            </div>

            <select
              value={mainFeaturedId}
              onChange={(e) => setMainFeaturedId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} - {formatBRL(p.price)}
                </option>
              ))}
            </select>

            {selectedMainFeatured && (
              <div className="p-3 rounded-2xl bg-[#FFF8FA] border border-[#FFE4E6] space-y-2">
                <img
                  src={selectedMainFeatured.imageUrl}
                  alt={selectedMainFeatured.title}
                  className="w-full h-32 object-cover rounded-xl border border-[#FFE4E6] bg-white"
                />
                <h4 className="font-bold text-xs text-[#2D1B22] line-clamp-2">
                  {selectedMainFeatured.title}
                </h4>
                <div className="text-xs font-black text-[#FF3B7F]">
                  {formatBRL(selectedMainFeatured.price)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Achadinho da Semana */}
        <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFEDD5] text-[#D97706] flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
                  Achadinho da Semana
                </h3>
                <p className="text-[10px] text-slate-500">Recomendação especial semanal</p>
              </div>
            </div>

            <select
              value={weeklyHighlightId}
              onChange={(e) => setWeeklyHighlightId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} - {formatBRL(p.price)}
                </option>
              ))}
            </select>

            {selectedWeekly && (
              <div className="p-3 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] space-y-2">
                <img
                  src={selectedWeekly.imageUrl}
                  alt={selectedWeekly.title}
                  className="w-full h-32 object-cover rounded-xl border border-[#FED7AA] bg-white"
                />
                <h4 className="font-bold text-xs text-[#2D1B22] line-clamp-2">
                  {selectedWeekly.title}
                </h4>
                <div className="text-xs font-black text-[#D97706]">
                  {formatBRL(selectedWeekly.price)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
