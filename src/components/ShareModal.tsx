import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  MessageCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { PLATFORMS_CONFIG, formatBRL } from '../utils/platformHelper';

interface ShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const platform = PLATFORMS_CONFIG[product.platform] || PLATFORMS_CONFIG.other;

  // Custom pre-formatted Brazilian WhatsApp copy
  const shareMessage = `✨ *Olha esse achadinho que a Sinara postou!* ✨\n\n` +
    `🛒 *${product.title}*\n` +
    `💰 *De:* ~${formatBRL(product.originalPrice)}~ *Por:* ${formatBRL(product.price)}` +
    (product.discountPercent ? ` (${product.discountPercent}% OFF!)` : '') + `\n` +
    (product.couponCode ? `🏷️ *Cupom:* ${product.couponCode} (${product.couponDiscount || 'Desconto extra'})\n` : '') +
    (product.sinaraReview ? `💖 *Dica da Sinara:* "${product.sinaraReview}"\n` : '') +
    `\n👉 *Garante aqui antes que acabe:* ${product.affiliateUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(product.affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedText(true);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleSendTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(product.affiliateUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  // QR Code URL via public safe API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    product.affiliateUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden my-auto p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 text-[#2D1B22]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF8FA] hover:bg-[#FFE4E6] text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE4E6] text-[#FF3B7F] flex items-center justify-center shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#2D1B22] text-lg font-['Outfit']">
              Compartilhar Achadinho 📲
            </h3>
            <p className="text-xs text-slate-600 font-medium">Envie para amigos, grupos de ofertas ou stories</p>
          </div>
        </div>

        {/* Product mini card preview */}
        <div className="bg-[#FFF8FA] rounded-2xl p-3.5 border-2 border-[#FFE4E6] flex items-center gap-3 mb-5">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-[#FFE4E6]"
          />
          <div className="min-w-0 flex-1">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${platform.badgeBg} ${platform.badgeText}`}>
              {platform.name}
            </span>
            <h4 className="font-bold text-[#2D1B22] text-xs truncate mt-1">
              {product.title}
            </h4>
            <div className="text-[#FF3B7F] font-black text-sm font-['Outfit']">
              {formatBRL(product.price)}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={handleSendWhatsApp}
            className="py-3 px-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Enviar no Zap</span>
          </button>

          <button
            onClick={handleSendTelegram}
            className="py-3 px-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar no Telegram</span>
          </button>
        </div>

        {/* Copy ready message */}
        <div className="space-y-3">
          <div className="relative">
            <div className="text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
              <span>Texto pronto com emojis:</span>
              <button
                onClick={handleCopyText}
                className="text-[#FF3B7F] hover:text-[#E0266A] text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={shareMessage}
              rows={4}
              className="w-full text-xs font-mono bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] text-slate-700 resize-none focus:outline-hidden"
            />
          </div>

          {/* Copy Direct Link */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={product.affiliateUrl}
              className="flex-1 bg-[#FFF8FA] text-xs font-mono py-2 px-3 rounded-xl border border-[#FFE4E6] text-slate-700 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3.5 rounded-xl bg-[#2D1B22] hover:bg-[#1A0E13] text-white text-xs font-black shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado' : 'Copiar Link'}</span>
            </button>
          </div>

          {/* Toggle QR Code */}
          <div className="pt-2">
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-bold text-slate-600 hover:text-[#FF3B7F] flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#FF3B7F]" />
              <span>{showQr ? 'Ocultar QR Code' : 'Gerar QR Code para Stories ou Impressão'}</span>
            </button>

            {showQr && (
              <div className="mt-3 p-4 bg-[#FFF8FA] border border-[#FFE4E6] rounded-2xl flex flex-col items-center">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-40 h-40 rounded-xl bg-white p-2 border border-[#FFE4E6] shadow-sm"
                />
                <p className="text-[11px] text-slate-600 mt-2 text-center font-medium">
                  Aponte a câmera do celular para abrir direto o produto
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
