import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Link as LinkIcon,
  ShoppingBag,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Download,
  Upload,
  Layers,
  Image as ImageIcon,
  Flame,
  Star,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Product, PlatformId, CategoryId, TagBadge } from '../types';
import {
  PLATFORMS_CONFIG,
  CATEGORIES_CONFIG,
  BADGES_CONFIG,
  detectPlatformFromUrl,
  calculateDiscount,
  formatBRL,
} from '../utils/platformHelper';

interface AdminManageModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetDefaults: () => void;
}

export const AdminManageModal: React.FC<AdminManageModalProps> = ({
  products,
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('mercadolivre');
  const [category, setCategory] = useState<Exclude<CategoryId, 'todos'>>('cozinha');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sinaraReview, setSinaraReview] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [installments, setInstallments] = useState('');
  const [badges, setBadges] = useState<TagBadge[]>(['testado_sinara', 'desconto_max']);
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle URL change with auto platform detector!
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAffiliateUrl(url);
    const detected = detectPlatformFromUrl(url);
    if (detected && detected !== 'other') {
      setPlatform(detected);
    }
  };

  const toggleBadge = (badge: TagBadge) => {
    if (badges.includes(badge)) {
      setBadges(badges.filter((b) => b !== badge));
    } else {
      setBadges([...badges, badge]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAffiliateUrl('');
    setPlatform('mercadolivre');
    setCategory('cozinha');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setDescription('');
    setSinaraReview('');
    setCouponCode('');
    setCouponDiscount('');
    setInstallments('');
    setBadges(['testado_sinara', 'desconto_max']);
    setIsFeatured(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setAffiliateUrl(product.affiliateUrl);
    setPlatform(product.platform);
    setCategory(product.category);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setImageUrl(product.imageUrl);
    setDescription(product.description || '');
    setSinaraReview(product.sinaraReview || '');
    setCouponCode(product.couponCode || '');
    setCouponDiscount(product.couponDiscount || '');
    setInstallments(product.installments || '');
    setBadges(product.badges || []);
    setIsFeatured(product.isFeatured || false);
    setActiveTab('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !affiliateUrl.trim() || !price) {
      setFormError('Por favor preencha o Título, o Link da Loja e o Preço.');
      return;
    }

    const numPrice = parseFloat(price.replace(',', '.'));
    const numOriginal = originalPrice
      ? parseFloat(originalPrice.replace(',', '.'))
      : numPrice;

    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Preço inválido.');
      return;
    }

    const discount = calculateDiscount(numPrice, numOriginal);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Achadinho incrível com link verificado pela Sinara.',
      sinaraReview: sinaraReview.trim() || undefined,
      price: numPrice,
      originalPrice: numOriginal,
      discountPercent: discount,
      affiliateUrl: affiliateUrl.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      platform,
      category,
      couponCode: couponCode.trim() || undefined,
      couponDiscount: couponDiscount.trim() || undefined,
      installments: installments.trim() || undefined,
      badges,
      likesCount: editingProduct ? editingProduct.likesCount : Math.floor(Math.random() * 200) + 50,
      clicksCount: editingProduct ? editingProduct.clicksCount : 0,
      isFeatured,
      isVerified: true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewCount: editingProduct ? editingProduct.reviewCount : Math.floor(Math.random() * 300) + 50,
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }

    resetForm();
    setActiveTab('list');
  };

  // Export & Import helpers
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sinara_achadinhos_catalogo_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const detectedConfig = PLATFORMS_CONFIG[platform];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-4 border-[#FFE4E6] overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#2D1B22]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-100 uppercase tracking-wider">
                Área de Curadoria
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Painel da Sinara • Cadastrar Achadinhos
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 py-3 border-b-2 border-[#FFE4E6] flex items-center justify-between bg-[#FFF8FA]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('create');
                if (!editingProduct) resetForm();
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#FF3B7F] text-white shadow-xs'
                  : 'bg-white text-[#2D1B22] hover:bg-[#FFE4E6] border border-[#FFE4E6]'
              }`}
            >
              {editingProduct ? '✏️ Editando Achadinho' : '➕ Novo Achadinho'}
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#FF3B7F] text-white shadow-xs'
                  : 'bg-white text-[#2D1B22] hover:bg-[#FFE4E6] border border-[#FFE4E6]'
              }`}
            >
              📋 Todos os Cadastrados ({products.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="text-xs font-bold text-[#2D1B22] hover:text-[#FF3B7F] bg-white border border-[#FFE4E6] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Baixar backup dos produtos em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Catálogo</span>
            </button>

            <button
              onClick={onResetDefaults}
              className="text-xs font-black text-[#FF3B7F] hover:text-[#E0266A] bg-[#FFE4E6] border border-[#FF3B7F]/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Restaurar lista padrão"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrões</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-[#FFE4E6] border border-[#FF3B7F] rounded-xl text-xs text-[#FF3B7F] font-black">
                  {formError}
                </div>
              )}

              {/* 1. URL & Auto-detection */}
              <div className="p-4 bg-[#FFF8FA] border-2 border-[#FFE4E6] rounded-2xl space-y-2">
                <label className="block text-xs font-black text-[#2D1B22] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#FF3B7F]" />
                    <span>Link do Produto (Mercado Livre, Magalu, Shopee, Amazon, Shein...) *</span>
                  </span>
                  {detectedConfig && (
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-black ${detectedConfig.badgeBg} ${detectedConfig.badgeText}`}>
                      Plataforma Detectada: {detectedConfig.name}
                    </span>
                  )}
                </label>
                <input
                  type="url"
                  required
                  value={affiliateUrl}
                  onChange={handleUrlChange}
                  placeholder="Cole o link aqui (ex: https://www.mercadolivre.com.br/... ou https://shopee.com.br/...)"
                  className="w-full text-xs font-mono bg-white p-3 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] focus:ring-2 focus:ring-[#FFE4E6] outline-hidden text-[#2D1B22]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store selection (Auto or manual) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plataforma / Loja *
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformId)}
                    className="w-full text-xs font-bold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  >
                    <option value="mercadolivre">Mercado Livre</option>
                    <option value="magalu">Magazine Luiza (Magalu)</option>
                    <option value="shopee">Shopee</option>
                    <option value="amazon">Amazon Brasil</option>
                    <option value="shein">Shein</option>
                    <option value="aliexpress">AliExpress</option>
                    <option value="tiktok">TikTok Shop</option>
                    <option value="other">Outra Loja Parceira</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Exclude<CategoryId, 'todos'>)}
                    className="w-full text-xs font-bold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  >
                    {CATEGORIES_CONFIG.filter((c) => c.id !== 'todos').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Achadinho *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Mini Seladora Térmica Portátil com Imã de Geladeira"
                  className="w-full text-sm font-semibold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço com Desconto (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.90"
                    className="w-full text-sm font-bold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço Original (R$)
                  </label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="59.90"
                    className="w-full text-sm font-semibold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parcelamento / Condição
                  </label>
                  <input
                    type="text"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    placeholder="Ex: 3x de R$ 9,90 ou Pix"
                    className="w-full text-xs bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  />
                </div>
              </div>

              {/* Image URL with preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL da Imagem do Produto (ou link de foto)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... ou link de imagem da loja"
                    className="flex-1 text-xs bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-[#FFE4E6]"
                    />
                  )}
                </div>
              </div>

              {/* Sinara's speech bubble tip */}
              <div className="p-3.5 bg-[#FFF8FA] border-2 border-[#FFE4E6] rounded-2xl space-y-1">
                <label className="block text-xs font-black text-[#FF3B7F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8A3B]" />
                  <span>Dica / Review Pessoal da Sinara (Dá aquele toque descontraído!)</span>
                </label>
                <textarea
                  value={sinaraReview}
                  onChange={(e) => setSinaraReview(e.target.value)}
                  rows={2}
                  placeholder="Ex: Meninas, usei na minha cozinha e virou meu vício! Super resistente e coube em qualquer cantinho."
                  className="w-full text-xs bg-white p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                />
              </div>

              {/* Coupon inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código do Cupom (Opcional)
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ex: MAGALU10 ou SINARA20"
                    className="w-full text-xs font-mono font-bold bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden uppercase text-[#2D1B22]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Regra do Cupom (Opcional)
                  </label>
                  <input
                    type="text"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    placeholder="Ex: R$ 10 OFF acima de R$ 50"
                    className="w-full text-xs bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-[#2D1B22]"
                  />
                </div>
              </div>

              {/* Selos / Badges toggles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selos & Destaques Visuais
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(BADGES_CONFIG) as TagBadge[]).map((tagKey) => {
                    const isSelected = badges.includes(tagKey);
                    const b = BADGES_CONFIG[tagKey];
                    return (
                      <button
                        type="button"
                        key={tagKey}
                        onClick={() => toggleBadge(tagKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF3B7F] text-white border-[#FF3B7F]'
                            : 'bg-[#FFF8FA] text-[#2D1B22] border-[#FFE4E6] hover:bg-[#FFE4E6]'
                        }`}
                      >
                        {b.emoji} {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#FFE4E6]">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Cancelar Edição
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Salvar Alterações' : 'Publicar Achadinho ✨'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Tab: Products List */
            <div className="space-y-3">
              {products.map((p) => {
                const platformConfig = PLATFORMS_CONFIG[p.platform] || PLATFORMS_CONFIG.other;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 bg-[#FFF8FA] rounded-2xl border-2 border-[#FFE4E6] hover:border-[#FF3B7F] shadow-xs flex items-center gap-3.5 transition-all"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-[#FFE4E6]"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${platformConfig.badgeBg} ${platformConfig.badgeText}`}>
                          {platformConfig.name}
                        </span>
                        {p.couponCode && (
                          <span className="text-[10px] font-black text-[#D97706] bg-[#FFF7ED] px-2 py-0.5 rounded-lg border border-[#FED7AA]">
                            Cupom: {p.couponCode}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-[#2D1B22] text-xs sm:text-sm truncate">
                        {p.title}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-[#FF3B7F] text-sm font-['Outfit']">
                          {formatBRL(p.price)}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatBRL(p.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FFE4E6] text-[#2D1B22] transition-colors border border-[#FFE4E6] cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FFE4E6] text-[#FF3B7F] transition-colors border border-[#FFE4E6] cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
