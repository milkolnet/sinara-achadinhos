import React from 'react';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  Bell,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface VipCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipCommunityModal: React.FC<VipCommunityModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    window.open('https://chat.whatsapp.com/invite-sinara-achadinhos-vip', '_blank');
  };

  const handleOpenTelegram = () => {
    window.open('https://t.me/sinara_achadinhos_oficial', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden my-auto p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200 text-[#2D1B22]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF8FA] hover:bg-[#FFE4E6] text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top badge */}
        <div className="w-16 h-16 rounded-3xl bg-[#FFE4E6] text-[#FF3B7F] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <MessageCircle className="w-8 h-8 fill-[#FF3B7F] text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4E6] text-[#FF3B7F] text-xs font-black mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF8A3B]" />
          <span>GRUPO VIP GRATUITO DA SINARA 💬</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-[#2D1B22] font-['Outfit'] mb-3">
          Receba os achadinhos antes de todo mundo!
        </h3>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          As melhores promoções, erros de preço e cupons relâmpago duram poucos minutos. Entre no nosso canal VIP silencioso para não perder nada.
        </p>

        {/* Benefits list */}
        <div className="bg-[#FFF8FA] border-2 border-[#FFE4E6] rounded-2xl p-4 text-left space-y-2.5 mb-6 text-xs text-[#2D1B22]">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>Notificação instantânea de cupons de 50% e 70% OFF</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>Sem spam: grupo fechado, apenas a Sinara posta links seguros</span>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>Links direto para Mercado Livre, Magalu, Shopee e Amazon</span>
          </div>
        </div>

        {/* Channel links */}
        <div className="space-y-3">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Entrar no Grupo VIP do WhatsApp</span>
          </button>

          <button
            onClick={handleOpenTelegram}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>Entrar no Canal do Telegram</span>
          </button>
        </div>

        <div className="mt-4 text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          <span>100% Gratuito e você pode sair quando quiser</span>
        </div>
      </div>
    </div>
  );
};
