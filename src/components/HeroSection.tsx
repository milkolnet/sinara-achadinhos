import React from 'react';
import {
  Sparkles,
  Dices,
  Ticket,
  ShieldCheck,
  Zap,
  TrendingDown,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Product } from '../types';
import { PLATFORMS_CONFIG, formatBRL } from '../utils/platformHelper';

interface HeroSectionProps {
  featuredProduct?: Product;
  onSelectProduct: (p: Product) => void;
  onOpenSurprise: () => void;
  onOpenCoupons: () => void;
  onOpenCommunity: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredProduct,
  onSelectProduct,
  onOpenSurprise,
  onOpenCoupons,
  onOpenCommunity,
}) => {
  const featuredPlatform = featuredProduct
    ? PLATFORMS_CONFIG[featuredProduct.platform]
    : null;

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
        {/* Decorative ambient background glows & shapes from Vibrant Palette */}
        <div className="w-64 h-64 bg-white/20 rounded-full blur-3xl absolute -right-20 -bottom-20 pointer-events-none" />
        <div className="w-72 h-72 bg-white/10 rounded-full blur-3xl absolute -left-20 -top-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Creator Identity & Bio */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Pill from Vibrant Palette */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-black text-white mb-4 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="uppercase tracking-wider">Garimpos Diários da Sinara • Edição 2026</span>
            </div>

            {/* Main Catchy Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-['Outfit'] leading-[1.12] mb-4">
              OS MELHORES ACHADINHOS DA INTERNET COM ATÉ 75% OFF!
            </h2>

            {/* Conversational Bio */}
            <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-6 max-w-2xl font-medium">
              Oi, amores! 💕 Eu passo o dia caçando as maiores pechinchas, novidades virais e cupons secretos no <strong>Mercado Livre, Magalu, Shopee, Amazon e Shein</strong>. Tudo testado, aprovado e 100% confiável!
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8">
              <button
                id="hero-surprise-button"
                onClick={onOpenSurprise}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF8FA] text-[#FF3B7F] font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Dices className="w-4 h-4 text-[#FF3B7F] animate-bounce" />
                <span>Achadinho Surpresa 🎲</span>
              </button>

              <button
                id="hero-coupons-button"
                onClick={onOpenCoupons}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-sm border-2 border-white/40 backdrop-blur-md shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-amber-300" />
                <span>Pegar Cupons 🏷️</span>
              </button>

              <button
                id="hero-community-button"
                onClick={onOpenCommunity}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white fill-white" />
                <span>Grupo VIP no Zap</span>
              </button>
            </div>

            {/* Trust and Social Proof Badges */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg pt-4 border-t border-white/20">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-white text-[#FF3B7F] flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">100% Seguro</div>
                  <div className="text-[10px] text-white/80 font-medium">Lojas Oficiais</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-white text-[#FF8A3B] flex items-center justify-center font-bold shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Até 75% OFF</div>
                  <div className="text-[10px] text-white/80 font-medium">Menor Preço</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-white text-[#FF3B7F] flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Cupons Reais</div>
                  <div className="text-[10px] text-white/80 font-medium">Testados Hoje</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured "Achado da Semana" Highlight Card */}
          <div className="lg:col-span-5">
            {featuredProduct ? (
              <div className="relative group">
                <div className="relative bg-white rounded-3xl border-4 border-white/40 p-4 sm:p-5 shadow-2xl overflow-hidden text-[#2D1B22]">
                  {/* Card Header Top */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B7F] text-white text-xs font-black tracking-wide shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ACHADINHO DE OURO ✨</span>
                    </div>

                    {featuredPlatform && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg ${featuredPlatform.badgeBg} ${featuredPlatform.badgeText} shadow-2xs`}
                      >
                        {featuredPlatform.name}
                      </span>
                    )}
                  </div>

                  {/* Product Image & Quick Badges */}
                  <div
                    className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group/img"
                    onClick={() => onSelectProduct(featuredProduct)}
                  >
                    <img
                      src={featuredProduct.imageUrl}
                      alt={featuredProduct.title}
                      className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                    {/* Discount badge */}
                    {featuredProduct.discountPercent && (
                      <div className="absolute top-3 left-3 bg-[#FF3B7F] text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-md">
                        -{featuredProduct.discountPercent}% OFF
                      </div>
                    )}

                    {/* Sinara Tip Preview Bubble */}
                    {featuredProduct.sinaraReview && (
                      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-[#FFE4E6] shadow-sm text-xs text-[#2D1B22] line-clamp-2">
                        <span className="font-bold text-[#FF3B7F] mr-1">Dica da Sinara:</span>
                        "{featuredProduct.sinaraReview}"
                      </div>
                    )}
                  </div>

                  {/* Title and Price Details */}
                  <div className="pt-3">
                    <h3
                      onClick={() => onSelectProduct(featuredProduct)}
                      className="font-bold text-[#2D1B22] text-base sm:text-lg hover:text-[#FF3B7F] cursor-pointer line-clamp-2 transition-colors mb-2"
                    >
                      {featuredProduct.title}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#FF3B7F] font-['Outfit']">
                        {formatBRL(featuredProduct.price)}
                      </span>
                      {featuredProduct.originalPrice > featuredProduct.price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatBRL(featuredProduct.originalPrice)}
                        </span>
                      )}
                      {featuredProduct.couponCode && (
                        <span className="ml-auto text-xs font-bold text-[#059669] bg-[#D1FAE5] border border-[#A7F3D0] px-2 py-0.5 rounded-md">
                          Cupom: {featuredProduct.couponCode}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="featured-details-button"
                        onClick={() => onSelectProduct(featuredProduct)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FFF8FA] hover:bg-[#FFE4E6] text-[#2D1B22] font-bold text-xs sm:text-sm border border-[#FFE4E6] transition-all"
                      >
                        Ver Detalhes 👀
                      </button>

                      <a
                        id="featured-direct-link"
                        href={featuredProduct.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                      >
                        <span>EU QUERO!</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border-2 border-white/40 text-[#2D1B22]">
                <ShoppingBag className="w-12 h-12 text-[#FF3B7F] mx-auto mb-2" />
                <p className="font-bold text-[#2D1B22]">Garimpando o melhor achado do dia...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
