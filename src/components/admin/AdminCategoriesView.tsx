import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, CheckCircle2, XCircle, Tag, AlertCircle, AlertTriangle } from 'lucide-react';
import { CategoryItem } from '../../types';
import { api } from '../../services/api';

interface AdminCategoriesViewProps {
  categories: CategoryItem[];
  onRefresh: () => Promise<void>;
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({ categories, onRefresh }) => {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [order, setOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingCategory(null);
    setName('');
    setSlug('');
    setEmoji('✨');
    setOrder(String(categories.length + 1));
    setIsActive(true);
    setError(null);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setIsNew(false);
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setEmoji(cat.emoji);
    setOrder(String(cat.order));
    setIsActive(cat.isActive);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await api.createCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          emoji: emoji.trim() || '✨',
          order: Number(order) || 1,
          isActive,
        });
      } else if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          emoji: emoji.trim(),
          order: Number(order) || 1,
          isActive,
        });
      }
      setIsNew(false);
      setEditingCategory(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteCategory(deleteId);
      setDeleteId(null);
      await onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao excluir categoria.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            Categorias ({categories.length})
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie os departamentos onde os achadinhos são organizados
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border-2 border-[#FFE4E6] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF8FA] border-b-2 border-[#FFE4E6] text-slate-500 font-black uppercase text-[10px]">
              <th className="p-4 w-12 text-center">Ordem</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Slug / Identificador</th>
              <th className="p-4 text-center">Produtos Vinculados</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE4E6]">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[#FFF8FA]/80 transition-colors">
                <td className="p-4 text-center font-black text-slate-400">
                  {cat.order}
                </td>
                <td className="p-4 font-bold text-[#2D1B22]">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">
                  {cat.slug || cat.id}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-[#FFF8FA] border border-[#FFE4E6] text-[#FF3B7F]">
                    {cat.productCount ?? 0} produtos
                  </span>
                </td>
                <td className="p-4 text-center">
                  {cat.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <XCircle className="w-3 h-3" /> Inativa
                    </span>
                  )}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      title="Editar"
                      className="p-1.5 rounded-xl text-slate-500 hover:bg-[#FFE4E6] hover:text-[#FF3B7F] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(cat.id);
                        setDeleteError(null);
                      }}
                      title="Excluir"
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Form for Create or Edit Category */}
      {(isNew || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4">
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              {isNew ? 'Nova Categoria' : 'Editar Categoria'}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Emoji</label>
                  <input
                    type="text"
                    required
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-center text-lg outline-hidden"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (isNew) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="Ex: Decoração & Casa"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Slug (URL)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="decoracao-casa"
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-mono outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#2D1B22]">Ordem</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] text-xs font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-black text-[#2D1B22]">Categoria Ativa</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-[#FFE4E6] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-['Outfit'] text-[#2D1B22]">
              Excluir Categoria?
            </h3>
            <p className="text-xs text-slate-600">
              Categorias com produtos cadastrados não podem ser excluídas sem antes mover ou remover os produtos.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 text-left">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
