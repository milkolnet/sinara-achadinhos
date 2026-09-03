import React, { useState } from 'react';
import { Settings, Save, Download, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SiteSettings, Product } from '../../types';
import { api } from '../../services/api';

interface AdminSettingsViewProps {
  settings: SiteSettings | null;
  products: Product[];
  onRefreshSettings: () => Promise<void>;
  onRefreshAll: () => Promise<void>;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  products,
  onRefreshSettings,
  onRefreshAll,
}) => {
  const [siteTitle, setSiteTitle] = useState(settings?.siteTitle || 'Sinara Achadinhos da Internet');
  const [tagline, setTagline] = useState(
    settings?.tagline || 'Garimpos, novidades e ofertas reais verificadas com carinho'
  );
  const [sinaraBio, setSinaraBio] = useState(
    settings?.sinaraBio ||
      'Curadora oficial de achadinhos da internet. Testo, seleciono e garimpo os melhores preços em Magalu, Shopee, Mercado Livre, Amazon e muito mais!'
  );
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(settings?.whatsappGroupUrl || '');
  const [telegramChannelUrl, setTelegramChannelUrl] = useState(settings?.telegramChannelUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagramUrl || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateSettings({
        siteTitle,
        tagline,
        sinaraBio,
        whatsappGroupUrl,
        telegramChannelUrl,
        instagramUrl,
      });
      await onRefreshSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      productsCount: products.length,
      settings: {
        siteTitle,
        tagline,
        sinaraBio,
      },
      products,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sinara-achadinhos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = async () => {
    setResetting(true);
    try {
      await api.resetDefaults();
      await onRefreshAll();
      setResetModalOpen(false);
      alert('Catálogo e configurações restaurados com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar catálogo');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
          Configurações da Vitrine
        </h2>
        <p className="text-xs text-slate-500">
          Personalize títulos, biografia da curadora, canais de divulgação e segurança
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Bio */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Identidade do Site & Curadoria
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">Nome da Vitrine</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">Slogan / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-semibold outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Mini Biografia da Sinara (exibida no rodapé e sobre)
              </label>
              <textarea
                rows={3}
                value={sinaraBio}
                onChange={(e) => setSinaraBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-medium outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Social and Community links */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Comunidades & Redes Sociais da Sinara
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">Link do Grupo VIP WhatsApp</label>
              <input
                type="url"
                value={whatsappGroupUrl}
                onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">Link do Canal no Telegram</label>
              <input
                type="url"
                value={telegramChannelUrl}
                onChange={(e) => setTelegramChannelUrl(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">Perfil no Instagram</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>

      {/* Backup & System Operations */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
          Backup & Manutenção do Catálogo
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF8FA] border border-[#FFE4E6]">
          <div>
            <h4 className="font-black text-xs text-[#2D1B22]">Exportar Backup Completo</h4>
            <p className="text-[11px] text-slate-500">
              Faça o download de todos os produtos e configurações em formato JSON
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-white border border-[#FFE4E6] hover:border-[#FF3B7F] text-[#2D1B22] hover:text-[#FF3B7F] text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Baixar JSON ({products.length} itens)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <div>
            <h4 className="font-black text-xs text-rose-800">Restaurar Catálogo Padrão</h4>
            <p className="text-[11px] text-rose-600">
              Restaura a lista inicial oficial de achadinhos e cupons pré-carregados
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>

      {/* Confirmation modal for Reset */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              Restaurar Catálogo Inicial?
            </h3>
            <p className="text-xs text-slate-600">
              Esta ação redefinirá o catálogo com os produtos padrão da curadoria da Sinara.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={resetting}
                onClick={() => setResetModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={resetting}
                onClick={handleResetDefaults}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                {resetting ? 'Restaurando...' : 'Sim, Restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
