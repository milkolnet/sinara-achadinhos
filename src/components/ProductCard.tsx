import React, { useState } from 'react';
import {
  ExternalLink,
  Heart,
  Share2,
  Copy,
  Check,
  Star,
  Sparkles,
  ShoppingBag,
  Flame,
  MessageSquareQuote,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import {
  PLATFORMS_CONFIG,
  BADGES_CONFIG,
  formatBRL,
} from '../utils/platformHelper';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (product: Product) => void;
  onOpenShare: (product: Product) => void;
  onTrackClick: (id: string) => void;
  onCopyCouponSuccess: (code: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onOpenShare,
  onTrackClick,
  onCopyCouponSuccess,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const platform = PLATFORMS_CONFIG[product.platform] || PLATFORMS_CONFIG.other;

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.couponCode) return;

    navigator.clipboard.writeText(product.couponCode);
    setCopiedCoupon(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
    });
    onCopyCouponSuccess(product.couponCode);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleGoToStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackClick(product.id);
  };

  return (
    <article
      className="group relative bg-white rounded-3xl border-2 border-[#FFE4E6] hover:border-[#FF3B7F] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Floating Badges */}
      <div
        className="relative w-full aspect-4/3 sm:aspect-square bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={imgSrc || product.imageUrl}
          alt={product.title}
          loading="lazy"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80')}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges: Store + Discount */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Store Badge */}
          <span
            className={`px-3 py-1 rounded-xl text-[11px] font-black shadow-sm ${platform.badgeBg} ${platform.badgeText} pointer-events-auto`}
          >
            {platform.name}
          </span>

          {/* Discount Pill */}
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-[#FF3B7F] text-white shadow-sm">
              -{product.discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {/* Quick Action Floating Buttons (Top Right & Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Quick Details Eye */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm backdrop-blur-xs transition-transform active:scale-90 hover:text-[#FF3B7F]"
            title="Ver detalhes do achadinho"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare(product);
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm backdrop-blur-xs transition-transform active:scale-90 hover:text-[#FF3B7F]"
            title="Compartilhar no WhatsApp / Copiar Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition-transform active:scale-90 ${
              isFavorite
                ? 'bg-[#FF3B7F] text-white'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-[#FF3B7F]'
            }`}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar nos favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Rating and Reviews snippet (Bottom Left) */}
        {product.rating && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            {product.reviewCount && (
              <span className="text-slate-300 font-normal">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div>
          {/* Specific Badges List */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.badges.slice(0, 2).map((b) => {
              const badgeInfo = BADGES_CONFIG[b];
              if (!badgeInfo) return null;
              return (
                <span
                  key={b}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
                >
                  <span>{badgeInfo.emoji}</span>
                  <span>{badgeInfo.label}</span>
                </span>
              );
            })}
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-bold text-[#2D1B22] text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#FF3B7F] cursor-pointer transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Sinara's speech bubble review note */}
          {product.sinaraReview && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-[#FFF8FA] border border-[#FFE4E6] text-xs text-[#2D1B22] flex items-start gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#FF3B7F] shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic text-[11px] leading-tight">
                <strong className="text-[#FF3B7F] not-italic font-black">Sinara:</strong> {product.sinaraReview}
              </p>
            </div>
          )}
        </div>

        {/* Pricing, Coupon & Actions */}
        <div className="pt-2 border-t border-[#FFE4E6]/80 space-y-2.5">
          {/* Prices */}
          <div>
            <div className="flex items-baseline gap-2">
              {product.price > 0 ? (
                <span className="text-xl sm:text-2xl font-black text-[#FF3B7F] font-['Outfit']">
                  {formatBRL(product.price)}
                </span>
              ) : (
                <span className="text-sm font-bold text-[#FF3B7F]">
                  Consulte no site
                </span>
              )}
              {product.originalPrice > product.price && product.originalPrice > 0 && product.price > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatBRL(product.originalPrice)}
                </span>
              )}
            </div>

            {product.installments && (
              <div className="text-[11px] text-slate-600 font-medium">
                {product.installments}
              </div>
            )}
          </div>

          {/* Coupon Code Strip if available */}
          {product.couponCode && (
            <div className="flex items-center justify-between bg-[#FFF7ED] border-2 border-dashed border-[#FED7AA] rounded-2xl px-3 py-1.5">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[10px] font-black text-[#D97706] uppercase">Cupom:</span>
                <span className="font-mono font-black text-xs text-[#2D1B22] bg-white px-2 py-0.5 rounded-lg border border-[#FED7AA] truncate">
                  {product.couponCode}
                </span>
              </div>
              <button
                onClick={handleCopyCoupon}
                className="ml-1 text-[10px] font-black text-[#D97706] hover:text-[#9A3412] flex items-center gap-1 bg-[#FFEDD5] hover:bg-[#FED7AA] px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                title="Copiar cupom"
              >
                {copiedCoupon ? (
                  <>
                    <Check className="w-3 h-3 text-[#059669]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Direct Buy / Open Store Action Button */}
          <div className="grid grid-cols-1 gap-1.5">
            <a
              id={`buy-btn-${product.id}`}
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoToStore}
              className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all text-center cursor-pointer group/btn"
            >
              <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span>Garantir na {platform.name}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
