import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Heart,
  Share2,
  Copy,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  Flame,
  ShoppingBag,
  MessageSquareQuote,
  CheckCircle2,
  Store,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import {
  PLATFORMS_CONFIG,
  BADGES_CONFIG,
  CATEGORIES_CONFIG,
  formatBRL,
} from '../utils/platformHelper';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenShare: (product: Product) => void;
  onTrackClick: (id: string) => void;
  onCopyCouponSuccess: (code: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onTrackClick,
  onCopyCouponSuccess,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const platform = PLATFORMS_CONFIG[product.platform] || PLATFORMS_CONFIG.other;
  const category = CATEGORIES_CONFIG.find((c) => c.id === product.category);
  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.imageUrl];

  const handleCopyCoupon = () => {
    if (!product.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopiedCoupon(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    onCopyCouponSuccess(product.couponCode);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleCopyProductLink = () => {
    navigator.clipboard.writeText(product.affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#2D1B22]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#FFE4E6] bg-[#FFF8FA]">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black ${platform.badgeBg} ${platform.badgeText}`}
            >
              {platform.name}
            </span>
            {category && (
              <span className="text-xs font-bold text-[#2D1B22] bg-white px-2.5 py-1 rounded-xl border border-[#FFE4E6]">
                {category.emoji} {category.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-[#FFE4E6] text-[#FF3B7F]'
                  : 'bg-white hover:bg-slate-100 text-slate-600'
              }`}
              title={isFavorite ? 'Salvo' : 'Salvar'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#FF3B7F] text-[#FF3B7F]' : ''}`} />
            </button>

            <button
              onClick={() => onOpenShare(product)}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Gallery images */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#FFE4E6]">
                <img
                  src={selectedImage}
                  alt={product.title}
                  onError={() => setSelectedImage('https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80')}
                  className="w-full h-full object-cover object-center"
                />
                {product.discountPercent && (
                  <div className="absolute top-3 left-3 bg-[#FF3B7F] text-white font-black text-sm px-3 py-1 rounded-xl shadow-md">
                    -{product.discountPercent}% OFF
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === img
                          ? 'border-[#FF3B7F] scale-95 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product details and price */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {product.badges.map((b) => {
                    const badgeInfo = BADGES_CONFIG[b];
                    if (!badgeInfo) return null;
                    return (
                      <span
                        key={b}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
                      >
                        <span>{badgeInfo.emoji}</span>
                        <span>{badgeInfo.label}</span>
                      </span>
                    );
                  })}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-[#2D1B22] font-['Outfit'] leading-tight mb-2">
                  {product.title}
                </h1>

                {/* Rating review summary */}
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 mr-1" />
                    <span>{product.rating || '4.9'}</span>
                  </div>
                  <span>•</span>
                  <span>{product.reviewCount || 480} avaliações</span>
                  <span>•</span>
                  <span className="text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                  </span>
                </div>

                {/* Pricing block */}
                <div className="p-4 rounded-2xl bg-[#FFF8FA] border-2 border-[#FFE4E6] space-y-1 mb-4">
                  <div className="text-xs text-slate-600 font-bold">Preço Promocional:</div>
                  <div className="flex items-baseline gap-2">
                    {product.price > 0 ? (
                      <span className="text-3xl sm:text-4xl font-black text-[#FF3B7F] font-['Outfit']">
                        {formatBRL(product.price)}
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-[#FF3B7F]">
                        Consulte valor no site parceiro
                      </span>
                    )}
                    {product.originalPrice > product.price && product.originalPrice > 0 && product.price > 0 && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatBRL(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.installments && (
                    <div className="text-xs text-slate-600 font-medium">
                      {product.installments}
                    </div>
                  )}
                </div>

                {/* Coupon prompt if available */}
                {product.couponCode && (
                  <div className="p-3 bg-[#FFF7ED] border-2 border-dashed border-[#FED7AA] rounded-2xl flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-black text-[#D97706] uppercase">
                        Cupom Exclusivo:
                      </div>
                      <div className="font-mono font-black text-base text-[#2D1B22]">
                        {product.couponCode}
                      </div>
                      <div className="text-[11px] text-[#D97706] font-bold">
                        {product.couponDiscount || 'Desconto extra no checkout'}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyCoupon}
                      className="px-3.5 py-2 rounded-xl bg-[#FF8A3B] hover:bg-[#EA580C] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {copiedCoupon ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Cupom</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Link to Store */}
              <div className="space-y-2 pt-2">
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrackClick(product.id)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-[#FF3B7F]/25 hover:shadow-xl transition-all text-center"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ir para a Loja Oficial ({platform.name})</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>

                <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Você será redirecionado para a página oficial e segura do produto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dica da Sinara Box */}
          {product.sinaraReview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF8FA] to-[#FFF7ED] border-2 border-[#FFE4E6] shadow-xs">
              <div className="flex items-center gap-2 mb-2 font-black text-[#2D1B22] text-sm">
                <div className="w-7 h-7 rounded-xl bg-[#FF3B7F] text-white flex items-center justify-center text-xs font-black">
                  S
                </div>
                <span>Opinião Sincera da Sinara:</span>
                <Sparkles className="w-4 h-4 text-[#FF3B7F]" />
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic font-medium">
                "{product.sinaraReview}"
              </p>
            </div>
          )}

          {/* Product Description text */}
          <div className="space-y-2 border-t border-[#FFE4E6] pt-4">
            <h3 className="font-black text-[#2D1B22] text-sm">Sobre este produto:</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
