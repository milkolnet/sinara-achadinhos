import React from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#2D1B22] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-[#FFE4E6] flex items-center gap-3 text-xs sm:text-sm font-bold max-w-md">
        <div className="w-7 h-7 rounded-xl bg-[#FF3B7F]/20 text-[#FF3B7F] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#FF8A3B]" />
        </div>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
