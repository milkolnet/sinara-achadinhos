import React, { useState } from 'react';
import {
  X,
  Ticket,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Coupon } from '../types';
import { PLATFORMS_CONFIG } from '../utils/platformHelper';

interface CouponsVaultModalProps {
  coupons: Coupon[];
  isOpen: boolean;
  onClose: () => void;
  onCopyCouponSuccess: (code: string) => void;
}

export const CouponsVaultModal: React.FC<CouponsVaultModalProps> = ({
  coupons,
  isOpen,
  onClose,
  onCopyCouponSuccess,
}) => {
  if (!isOpen) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    confetti({
      particleCount: 35,
      spread: 65,
      origin: { y: 0.7 },
    });
    onCopyCouponSuccess(coupon.code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCoupons =
    activeTab === 'todos'
      ? coupons
      : coupons.filter((c) => c.platform === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#2D1B22]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-100 uppercase tracking-wider">
                Economize Agora
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Cofre de Cupons da Sinara 🏷️
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Tabs */}
        <div className="px-5 py-3 border-b-2 border-[#FFE4E6] flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#FFF8FA]">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'todos'
                ? 'bg-[#FF3B7F] text-white shadow-xs'
                : 'bg-white text-[#2D1B22] hover:bg-[#FFE4E6] border border-[#FFE4E6]'
            }`}
          >
            Todos os Cupons ({coupons.length})
          </button>

          {['magalu', 'mercadolivre', 'shopee', 'shein', 'amazon', 'aliexpress'].map((storeKey) => {
            const p = PLATFORMS_CONFIG[storeKey as keyof typeof PLATFORMS_CONFIG];
            if (!p) return null;
            const count = coupons.filter((c) => c.platform === storeKey).length;
            if (count === 0) return null;

            return (
              <button
                key={storeKey}
                onClick={() => setActiveTab(storeKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === storeKey
                    ? 'bg-[#2D1B22] text-white shadow-xs'
                    : 'bg-white text-[#2D1B22] hover:bg-[#FFE4E6] border border-[#FFE4E6]'
                }`}
              >
                {p.shortName} ({count})
              </button>
            );
          })}
        </div>

        {/* Coupons List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 flex-1">
          {filteredCoupons.map((coupon) => {
            const platform = PLATFORMS_CONFIG[coupon.platform] || PLATFORMS_CONFIG.other;
            const isCopied = copiedId === coupon.id;

            return (
              <div
                key={coupon.id}
                className="relative bg-[#FFF8FA] rounded-2xl border-2 border-dashed border-[#FFE4E6] hover:border-[#FF3B7F] p-4 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${platform.badgeBg} ${platform.badgeText}`}
                    >
                      {platform.name}
                    </span>
                    {coupon.badge && (
                      <span className="text-[10px] font-black text-[#FF3B7F] bg-[#FFE4E6] border border-[#FF3B7F]/30 px-2 py-0.5 rounded-lg">
                        {coupon.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-[#2D1B22] text-sm sm:text-base">
                    {coupon.description}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    {coupon.validUntil && <span>⏳ {coupon.validUntil}</span>}
                    {coupon.minimumSpend && <span>• Mínimo: R$ {coupon.minimumSpend}</span>}
                  </div>
                </div>

                {/* Code and Copy Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <div className="bg-white px-3 py-2 rounded-xl border border-[#FED7AA] font-mono font-black text-sm text-[#2D1B22] select-all text-center">
                    {coupon.code}
                  </div>

                  <button
                    onClick={() => handleCopy(coupon)}
                    className={`py-2.5 px-4 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${
                      isCopied
                        ? 'bg-[#059669] text-white'
                        : 'bg-[#FF3B7F] hover:bg-[#E0266A] text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="p-4 bg-[#FFF8FA] border-t-2 border-[#FFE4E6] text-center text-xs text-slate-600 font-medium">
          💡 <strong>Como usar:</strong> Copie o código aqui e cole no campo "Cupom de Desconto" no carrinho da loja antes de finalizar o pagamento.
        </div>
      </div>
    </div>
  );
};
