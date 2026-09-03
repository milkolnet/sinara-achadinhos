import React, { useState } from 'react';
import {
  X,
  Dices,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { PLATFORMS_CONFIG, formatBRL } from '../utils/platformHelper';

interface SurpriseWheelModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const SurpriseWheelModal: React.FC<SurpriseWheelModalProps> = ({
  products,
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'all' | 'under50' | 'kitchen' | 'tech'>('all');
  const [currentResult, setCurrentResult] = useState<Product | null>(null);

  const getFilteredPool = () => {
    switch (selectedMood) {
      case 'under50':
        return products.filter((p) => p.price <= 50);
      case 'kitchen':
        return products.filter((p) => p.category === 'cozinha' || p.category === 'casa');
      case 'tech':
        return products.filter((p) => p.category === 'tecnologia' || p.category === 'organizacao');
      default:
        return products;
    }
  };

  const handleSpin = () => {
    const pool = getFilteredPool();
    if (pool.length === 0) return;

    setIsSpinning(true);
    setCurrentResult(null);

    // Simulated roulette cycling animation
    let count = 0;
    const interval = setInterval(() => {
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setCurrentResult(randomItem);
      count++;

      if (count > 12) {
        clearInterval(interval);
        const finalItem = pool[Math.floor(Math.random() * pool.length)];
        setCurrentResult(finalItem);
        setIsSpinning(false);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 100);
  };

  const platform = currentResult ? PLATFORMS_CONFIG[currentResult.platform] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden text-center p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-[#2D1B22]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF8FA] hover:bg-[#FFE4E6] text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-[#FFF7ED] text-[#D97706] text-xs font-black mb-3 border border-[#FED7AA]">
          <Dices className="w-4 h-4 text-[#FF8A3B]" />
          <span>ROLETA DE ACHADINHOS 🎲</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#2D1B22] font-['Outfit'] mb-2">
          Não sabe o que comprar?
        </h2>
        <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto font-medium">
          Deixe a Sinara escolher um achadinho imperdível para você hoje com mega desconto!
        </p>

        {/* Mood filter selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedMood === 'all'
                ? 'bg-[#FF8A3B] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#2D1B22] border border-[#FFE4E6] hover:bg-[#FFE4E6]'
            }`}
          >
            ✨ Qualquer Achado
          </button>
          <button
            onClick={() => setSelectedMood('under50')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedMood === 'under50'
                ? 'bg-[#FF8A3B] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#2D1B22] border border-[#FFE4E6] hover:bg-[#FFE4E6]'
            }`}
          >
            💰 Até R$ 50
          </button>
          <button
            onClick={() => setSelectedMood('kitchen')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedMood === 'kitchen'
                ? 'bg-[#FF8A3B] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#2D1B22] border border-[#FFE4E6] hover:bg-[#FFE4E6]'
            }`}
          >
            🍳 Cozinha & Casa
          </button>
          <button
            onClick={() => setSelectedMood('tech')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedMood === 'tech'
                ? 'bg-[#FF8A3B] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#2D1B22] border border-[#FFE4E6] hover:bg-[#FFE4E6]'
            }`}
          >
            ⚡ Gadgets & Casa
          </button>
        </div>

        {/* Result Card or Wheel placeholder */}
        <div className="min-h-[220px] flex items-center justify-center mb-6">
          {currentResult ? (
            <div className="w-full bg-[#FFF8FA] rounded-2xl p-4 border-2 border-[#FFE4E6] shadow-sm flex flex-col sm:flex-row items-center gap-4 text-left">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white shrink-0 border-2 border-[#FFE4E6] shadow-xs">
                <img
                  src={currentResult.imageUrl}
                  alt={currentResult.title}
                  className="w-full h-full object-cover"
                />
                {currentResult.discountPercent && (
                  <span className="absolute top-1 left-1 bg-[#FF3B7F] text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                    -{currentResult.discountPercent}%
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                {platform && (
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${platform.badgeBg} ${platform.badgeText}`}>
                    {platform.name}
                  </span>
                )}
                <h4 className="font-bold text-[#2D1B22] text-sm line-clamp-2">
                  {currentResult.title}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#FF3B7F] font-['Outfit']">
                    {formatBRL(currentResult.price)}
                  </span>
                  {currentResult.originalPrice > currentResult.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatBRL(currentResult.originalPrice)}
                    </span>
                  )}
                </div>
                {currentResult.sinaraReview && (
                  <p className="text-[11px] text-slate-600 italic line-clamp-1 font-medium">
                    "{currentResult.sinaraReview}"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-[#FED7AA] bg-[#FFF7ED]/50 rounded-2xl text-[#D97706] flex flex-col items-center">
              <Dices className="w-12 h-12 text-[#FF8A3B] mb-2 animate-bounce" />
              <span className="text-sm font-bold">Clique no botão abaixo para sortear!</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF8A3B] to-[#FF3B7F] hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Sorteando...' : currentResult ? 'Sortear Outro 🎲' : 'Girar a Roleta da Sinara 🎲'}</span>
          </button>

          {currentResult && !isSpinning && (
            <button
              onClick={() => {
                onClose();
                onSelectProduct(currentResult);
              }}
              className="py-3.5 px-5 rounded-2xl bg-[#2D1B22] hover:bg-[#1A0E13] text-white font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>Ver Produto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
