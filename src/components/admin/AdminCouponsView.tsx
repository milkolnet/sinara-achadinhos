import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Ticket, CheckCircle2, XCircle, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { Coupon, PlatformId } from '../../types';
import { api } from '../../services/api';
import { PLATFORMS_CONFIG } from '../../utils/platformHelper';

interface AdminCouponsViewProps {
  coupons: Coupon[];
  onRefresh: () => Promise<void>;
}

export const AdminCouponsView: React.FC<AdminCouponsViewProps> = ({ coupons, onRefresh }) => {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [code, setCode] = useState('');
  const [store, setStore] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('mercadolivre');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [minimumSpend, setMinimumSpend] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [badge, setBadge] = useState('Verificado');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingCoupon(null);
    setCode('');
    setStore('Mercado Livre');
    setPlatform('mercadolivre');
    setDescription('');
    setDiscount('10% OFF');
    setMinimumSpend('');
    setValidUntil('');
    setAffiliateUrl('');
    setBadge('Verificado');
    setIsActive(true);
    setError(null);
  };

  const handleOpenEdit = (c: Coupon) => {
    setIsNew(false);
    setEditingCoupon(c);
    setCode(c.code);
    setStore(c.store);
    setPlatform(c.platform);
    setDescription(c.description);
    setDiscount(c.discount);
    setMinimumSpend(c.minimumSpend ? String(c.minimumSpend) : '');
    setValidUntil(c.validUntil || '');
    setAffiliateUrl(c.affiliateUrl || '');
    setBadge(c.badge || 'Verificado');
    setIsActive(c.isActive !== false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('O código do cupom é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Coupon> = {
        code: code.trim().toUpperCase(),
        store: store.trim() || 'Loja',
        platform,
        description: description.trim(),
        discount: discount.trim() || 'Desconto Especial',
        minimumSpend: minimumSpend ? parseFloat(minimumSpend) : 0,
        validUntil: validUntil.trim() || undefined,
        affiliateUrl: affiliateUrl.trim() || undefined,
        badge: badge.trim() || 'Verificado',
        isActive,
      };

      if (isNew) {
        await api.createCoupon(payload);
      } else if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, payload);
      }

      setIsNew(false);
      setEditingCoupon(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cupom.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
    try {
      await api.deleteCoupon(id);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cupom.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Central de Cupons ({coupons.length})
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie códigos promocionais, regras e contadores de cópias
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Novo Cupom</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF8FA] border-b-2 border-[#FFE4E6] text-slate-500 font-black uppercase text-[10px]">
              <th className="p-4">Cupom & Loja</th>
              <th className="p-4">Desconto</th>
              <th className="p-4">Regra / Descrição</th>
              <th className="p-4">Validade</th>
              <th className="p-4 text-center">Cópias</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE4E6]">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-[#FFF8FA]/80 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]">
                      {c.code}
                    </span>
                    <span className="font-bold text-[#2D1B22]">{c.store}</span>
                  </div>
                </td>

                <td className="p-4 font-black text-[#FF3B7F]">{c.discount}</td>

                <td className="p-4 text-slate-600 max-w-xs truncate">{c.description}</td>

                <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">
                  {c.validUntil || 'Até durar o estoque'}
                </td>

                <td className="p-4 text-center font-bold text-slate-700">
                  <span className="inline-flex items-center gap-1 bg-[#FFF8FA] px-2 py-0.5 rounded-md border border-[#FFE4E6]">
                    <Copy className="w-3 h-3 text-[#FF3B7F]" />
                    {c.copyCount || 0}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {c.isActive !== false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <XCircle className="w-3 h-3" /> Inativo
                    </span>
                  )}
                </td>

                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      title="Editar"
                      className="p-1.5 rounded-xl text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Excluir"
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit / Create Coupon */}
      {(isNew || editingCoupon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4">
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              {isNew ? 'Cadastrar Cupom' : 'Editar Cupom'}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Código do Cupom</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: PROMO20"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono font-bold text-[#4338CA] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Desconto</label>
                  <input
                    type="text"
                    required
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Ex: 20% OFF ou R$ 30"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold text-[#FF3B7F] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Loja / Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value as PlatformId);
                      setStore(PLATFORMS_CONFIG[e.target.value as PlatformId]?.name || 'Loja');
                    }}
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-semibold outline-hidden"
                  >
                    {Object.values(PLATFORMS_CONFIG).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Gasto Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minimumSpend}
                    onChange={(e) => setMinimumSpend(e.target.value)}
                    placeholder="Ex: 100.00"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-semibold outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">Regras / Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Válido na primeira compra ou em itens selecionados"
                  className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Validade</label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    placeholder="Ex: 31/12/2026"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-semibold outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Status</label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-black text-[#2D1B22]">Cupom Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingCoupon(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
