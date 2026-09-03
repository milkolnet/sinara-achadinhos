import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] p-6 sm:p-8 space-y-6 text-[#2D1B22]">
        {/* Header with brand identity */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3B7F] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF3B7F]/30 font-black text-2xl font-['Outfit']">
            S
          </div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Área Administrativa
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Painel de Gestão e Curadoria dos Achadinhos da Sinara
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#FEE2E2] border-2 border-[#FECDD3] rounded-2xl text-xs font-bold text-[#FF3B7F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black text-[#2D1B22]">
              Usuário Administrador
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Informe o usuário..."
                className="w-full pl-10 pr-3 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] focus:ring-2 focus:ring-[#FFE4E6] outline-hidden text-sm font-semibold text-[#2D1B22]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-[#2D1B22]">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Informe a senha de acesso..."
                className="w-full pl-10 pr-3 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] focus:ring-2 focus:ring-[#FFE4E6] outline-hidden text-sm font-semibold text-[#2D1B22]"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Acesso seguro e protegido. As sessões são autenticadas e auditadas em conformidade com as políticas do sistema.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={onBackToStore}
            className="text-xs font-bold text-slate-600 hover:text-[#FF3B7F] transition-colors cursor-pointer"
          >
            ← Voltar para a Vitrine Pública
          </button>
        </div>
      </div>
    </div>
  );
};
