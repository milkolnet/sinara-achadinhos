import React from 'react';
import {
  X,
  Heart,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types';
import { PLATFORMS_CONFIG, formatBRL } from '../utils/platformHelper';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (id: string) => void;
  onSelectProduct: (p: Product) => void;
  onClearFavorites: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProduct,
  onClearFavorites,
}) => {
  if (!isOpen) return null;

  const totalPrice = favorites.reduce((acc, p) => acc + p.price, 0);
  const totalOriginal = favorites.reduce((acc, p) => acc + (p.originalPrice || p.price), 0);
  const totalSaved = totalOriginal - totalPrice;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b-2 border-[#FFE4E6] flex items-center justify-between bg-[#FFF8FA]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#FF3B7F] text-white flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-black text-[#2D1B22] text-lg font-['Outfit']">
                  Meus Salvos ({favorites.length})
                </h3>
                <p className="text-xs text-slate-600 font-medium">Seus achadinhos favoritos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {favorites.length > 0 && (
                <button
                  onClick={onClearFavorites}
                  className="text-xs text-[#FF3B7F] hover:text-[#E0266A] font-black p-1 cursor-pointer"
                  title="Limpar todos"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-[#FFE4E6] text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of saved items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-3xl bg-[#FFE4E6] text-[#FF3B7F] flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-black text-[#2D1B22] text-base mb-1">
                  Sua lista de desejos está vazia!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mb-6">
                  Clique no coraçãozinho dos achadinhos que você gostar para salvar e comprar depois.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-[#FF3B7F] hover:bg-[#E0266A] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Explorar Achadinhos ✨
                </button>
              </div>
            ) : (
              favorites.map((product) => {
                const platform = PLATFORMS_CONFIG[product.platform] || PLATFORMS_CONFIG.other;

                return (
                  <div
                    key={product.id}
                    className="p-3 bg-[#FFF8FA] rounded-2xl border-2 border-[#FFE4E6] hover:border-[#FF3B7F] shadow-xs flex items-center gap-3 group transition-all"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-18 h-18 rounded-xl object-cover shrink-0 cursor-pointer bg-slate-100 border border-[#FFE4E6]"
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${platform.badgeBg} ${platform.badgeText}`}
                        >
                          {platform.name}
                        </span>
                        {product.couponCode && (
                          <span className="text-[9px] font-black text-[#D97706] bg-[#FFF7ED] px-2 py-0.5 rounded-lg border border-[#FED7AA]">
                            Cupom: {product.couponCode}
                          </span>
                        )}
                      </div>

                      <h5
                        onClick={() => {
                          onClose();
                          onSelectProduct(product);
                        }}
                        className="font-bold text-[#2D1B22] text-xs truncate cursor-pointer hover:text-[#FF3B7F] mb-1"
                      >
                        {product.title}
                      </h5>

                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-[#FF3B7F] text-sm font-['Outfit']">
                          {formatBRL(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatBRL(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FF3B7F] hover:bg-[#E0266A] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title="Comprar agora"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onRemoveFavorite(product.id)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FFE4E6] text-slate-400 hover:text-[#FF3B7F] transition-colors border border-[#FFE4E6] cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Totals */}
          {favorites.length > 0 && (
            <div className="p-5 border-t-2 border-[#FFE4E6] bg-[#FFF8FA] space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span>Total dos achados salvos:</span>
                  <span className="font-black text-[#2D1B22]">{formatBRL(totalPrice)}</span>
                </div>
                {totalSaved > 0 && (
                  <div className="flex items-center justify-between text-xs font-black text-[#059669]">
                    <span>Você está economizando:</span>
                    <span>{formatBRL(totalSaved)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const titles = favorites.map((f) => `• ${f.title} (${formatBRL(f.price)})\n  ${f.affiliateUrl}`).join('\n\n');
                  const message = `✨ Olha os achadinhos da Sinara que eu salvei:\n\n${titles}\n\nGarimpado em Sinara Achadinhos!`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar Minha Lista no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
