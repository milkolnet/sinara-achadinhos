import React, { useState } from 'react';
import { PlusCircle, Edit2, Store, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { PlatformItem } from '../../types';
import { api } from '../../services/api';

interface AdminPlatformsViewProps {
  platforms: PlatformItem[];
  onRefresh: () => Promise<void>;
}

export const AdminPlatformsView: React.FC<AdminPlatformsViewProps> = ({ platforms, onRefresh }) => {
  const [editingPlatform, setEditingPlatform] = useState<PlatformItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [accentColor, setAccentColor] = useState('#FF3B7F');
  const [badgeBg, setBadgeBg] = useState('bg-slate-100');
  const [badgeText, setBadgeText] = useState('text-slate-700 font-bold');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingPlatform(null);
    setName('');
    setShortName('');
    setDomainsInput('');
    setAccentColor('#FF3B7F');
    setBadgeBg('bg-slate-100');
    setBadgeText('text-slate-700 font-bold');
    setIsActive(true);
    setError(null);
  };

  const handleOpenEdit = (p: PlatformItem) => {
    setIsNew(false);
    setEditingPlatform(p);
    setName(p.name);
    setShortName(p.shortName);
    setDomainsInput(p.domains?.join(', ') || '');
    setAccentColor(p.accentColor || '#FF3B7F');
    setBadgeBg(p.badgeBg || 'bg-slate-100');
    setBadgeText(p.badgeText || 'text-slate-700 font-bold');
    setIsActive(p.isActive);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('O nome da loja/plataforma é obrigatório.');
      return;
    }

    const domains = domainsInput
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    setSaving(true);
    try {
      if (isNew) {
        await api.createPlatform({
          name: name.trim(),
          shortName: shortName.trim() || name.trim(),
          domains,
          accentColor,
          badgeBg,
          badgeText,
          isActive,
        });
      } else if (editingPlatform) {
        await api.updatePlatform(editingPlatform.id, {
          name: name.trim(),
          shortName: shortName.trim() || name.trim(),
          domains,
          accentColor,
          badgeBg,
          badgeText,
          isActive,
        });
      }
      setIsNew(false);
      setEditingPlatform(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar plataforma.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Lojas & Plataformas Parceiras ({platforms.length})
          </h2>
          <p className="text-xs text-slate-500">
            Configure regras de detecção automática por URL e estilos de selos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Nova Loja</span>
        </button>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((plat) => (
          <div
            key={plat.id}
            className="bg-white rounded-3xl border-2 border-[#FFE4E6] p-5 shadow-2xs space-y-4 hover:border-[#FF3B7F]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: plat.accentColor || '#FF3B7F' }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                  >
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
                      {plat.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {plat.shortName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(plat)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badge Preview */}
              <div>
                <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">
                  Selo Visual
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg inline-block ${plat.badgeBg} ${plat.badgeText}`}
                >
                  {plat.name}
                </span>
              </div>

              {/* Domains list */}
              <div>
                <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">
                  Domínios Reconhecidos
                </span>
                <div className="flex flex-wrap gap-1">
                  {plat.domains && plat.domains.length > 0 ? (
                    plat.domains.map((d, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFF8FA] border border-[#FFE4E6] text-slate-600 font-semibold"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Nenhum domínio</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#FFE4E6] flex items-center justify-between text-xs">
              <span className="font-black text-[#FF3B7F]">
                {plat.productCount ?? 0} achados ativos
              </span>

              {plat.isActive ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Ativa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  <XCircle className="w-3 h-3" /> Inativa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit/Create Platform */}
      {(isNew || editingPlatform) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4">
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              {isNew ? 'Cadastrar Nova Loja' : 'Editar Loja / Plataforma'}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Magazine Luiza"
                  className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">Nome Curto</label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="Ex: Magalu"
                  className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">
                  Domínios Reconhecidos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  placeholder="ex: magazineluiza.com.br, magalu.com"
                  className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Cor de Destaque</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#FFE4E6] cursor-pointer"
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
                    <span className="text-xs font-black text-[#2D1B22]">Loja Ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingPlatform(null);
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
                  {saving ? 'Salvando...' : 'Salvar Loja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
