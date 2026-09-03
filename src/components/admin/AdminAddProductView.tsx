import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Star,
  Heart,
  Save,
  Undo2,
  Ticket,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Product, PlatformId, TagBadge } from '../../types';
import { api } from '../../services/api';
import {
  PLATFORMS_CONFIG,
  CATEGORIES_CONFIG,
  BADGES_CONFIG,
  formatBRL,
} from '../../utils/platformHelper';

interface AdminAddProductViewProps {
  productToEdit?: Product | null;
  onSaveSuccess: (savedProduct: Product) => void;
  onCancel: () => void;
}

const AVAILABLE_BADGES: { id: TagBadge; label: string; emoji: string }[] = [
  { id: 'testado_sinara', label: 'Testado pela Sinara', emoji: '💖' },
  { id: 'cupom', label: 'Com Cupom', emoji: '🏷️' },
  { id: 'mais_popular', label: 'Mais Popular', emoji: '🏆' },
  { id: 'mais_vendido', label: 'Mais Vendido', emoji: '⭐' },
  { id: 'frete_gratis', label: 'Frete Grátis', emoji: '🚚' },
  { id: 'viral', label: 'Viral das Redes', emoji: '🔥' },
  { id: 'desconto_max', label: 'Super Desconto', emoji: '📉' },
  { id: 'cupom_ativo', label: 'Cupom Ativo', emoji: '🎟️' },
  { id: 'achadinho_ouro', label: 'Achadinho de Ouro', emoji: '👑' },
];

export const AdminAddProductView: React.FC<AdminAddProductViewProps> = ({
  productToEdit,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(productToEdit);

  // Link analyzer state
  const [inputUrl, setInputUrl] = useState(productToEdit?.affiliateUrl || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Form states
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [sinaraReview, setSinaraReview] = useState(productToEdit?.sinaraReview || '');
  const [price, setPrice] = useState<string>(productToEdit ? String(productToEdit.price) : '');
  const [originalPrice, setOriginalPrice] = useState<string>(
    productToEdit ? String(productToEdit.originalPrice) : ''
  );
  const [affiliateUrl, setAffiliateUrl] = useState(productToEdit?.affiliateUrl || '');
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
  const [galleryInput, setGalleryInput] = useState(
    productToEdit?.galleryImages?.join('\n') || ''
  );
  const [platform, setPlatform] = useState<PlatformId>(productToEdit?.platform || 'mercadolivre');
  const [category, setCategory] = useState<string>(productToEdit?.category || 'casa');
  const [subcategory, setSubcategory] = useState(productToEdit?.subcategory || '');
  const [couponCode, setCouponCode] = useState(productToEdit?.couponCode || '');
  const [couponDiscount, setCouponDiscount] = useState(productToEdit?.couponDiscount || '');
  const [installments, setInstallments] = useState(productToEdit?.installments || 'À vista ou parcelado');
  const [selectedBadges, setSelectedBadges] = useState<TagBadge[]>(
    productToEdit?.badges || ['testado_sinara']
  );
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured || false);
  const [isGoldFind, setIsGoldFind] = useState(productToEdit?.isGoldFind || false);
  const [isActive, setIsActive] = useState(productToEdit?.isActive !== false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto calculate discount percentage
  const numPrice = parseFloat(price) || 0;
  const numOrig = parseFloat(originalPrice) || 0;
  const calculatedDiscount =
    numOrig > numPrice && numPrice > 0
      ? Math.round(((numOrig - numPrice) / numOrig) * 100)
      : 0;

  // Link analyzer handler
  const handleAnalyzeLink = async () => {
    if (!inputUrl.trim()) {
      setAnalysisStatus({
        type: 'error',
        message: 'Por favor, cole um link antes de analisar.',
      });
      return;
    }

    setAnalyzing(true);
    setAnalysisStatus(null);

    try {
      const res = await api.analyzeLink(inputUrl.trim());
      setAffiliateUrl(inputUrl.trim());
      setPlatform(res.platform);

      if (res.suggestedTitle && !title) setTitle(res.suggestedTitle);
      if (res.suggestedImage && !imageUrl) setImageUrl(res.suggestedImage);
      if (res.suggestedDescription && !description) setDescription(res.suggestedDescription);
      if (res.suggestedPrice && !price) setPrice(String(res.suggestedPrice));
      if (res.suggestedOriginalPrice && !originalPrice) setOriginalPrice(String(res.suggestedOriginalPrice));

      setAnalysisStatus({
        type: 'success',
        message: res.message || `Plataforma ${res.platformName} identificada com sucesso!`,
      });
    } catch (err: any) {
      setAnalysisStatus({
        type: 'info',
        message: err.message || 'Plataforma detectada. Por favor, preencha os campos abaixo para salvar.',
      });
      setAffiliateUrl(inputUrl.trim());
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleBadge = (badge: TagBadge) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('O título do produto é obrigatório.');
      return;
    }
    if (!affiliateUrl.trim()) {
      setFormError('O link de afiliado é obrigatório.');
      return;
    }
    if (numPrice <= 0) {
      setFormError('Informe um preço atual válido maior que zero.');
      return;
    }

    // Process gallery images
    const galleryImages = galleryInput
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'));

    if (imageUrl.trim() && !galleryImages.includes(imageUrl.trim())) {
      galleryImages.unshift(imageUrl.trim());
    }

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        title: title.trim(),
        description: description.trim(),
        sinaraReview: sinaraReview.trim(),
        price: numPrice,
        originalPrice: numOrig > 0 ? numOrig : numPrice,
        affiliateUrl: affiliateUrl.trim(),
        platformUrl: affiliateUrl.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        galleryImages,
        platform,
        category,
        subcategory: subcategory.trim(),
        couponCode: couponCode.trim().toUpperCase() || undefined,
        couponDiscount: couponDiscount.trim() || undefined,
        installments: installments.trim(),
        badges: selectedBadges,
        isFeatured,
        isGoldFind,
        isActive,
      };

      let saved: Product;
      if (isEditing && productToEdit) {
        saved = await api.updateProduct(productToEdit.id, payload);
      } else {
        saved = await api.createProduct(payload);
      }

      onSaveSuccess(saved);
    } catch (err: any) {
      setFormError(err.message || 'Ocorreu um erro ao salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 hover:text-[#FF3B7F] flex items-center gap-1 mb-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Voltar para listagem</span>
          </button>
          <h2 className="text-2xl font-black font-['Outfit'] text-[#2D1B22]">
            {isEditing ? 'Editar Achadinho' : 'Cadastrar Novo Achadinho'}
          </h2>
          <p className="text-xs text-slate-500">
            Preencha os detalhes e o link de afiliado para atualizar a vitrine
          </p>
        </div>
      </div>

      {/* STEP 1: Intelligent Link Analyzer Box */}
      <div className="bg-gradient-to-br from-[#FFF8FA] via-white to-[#FFF0F3] p-6 rounded-3xl border-3 border-[#FFE4E6] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF3B7F] text-white flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
              Cadastro Inteligente por Link
            </h3>
            <p className="text-xs text-slate-500">
              Cole o link do produto ou seu link de afiliado para identificação automática da loja
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Cole o link do produto (ex: mercadolivre.com.br, shopee, magalu...)"
              className="w-full pl-10 pr-3 py-3 bg-white rounded-2xl border-2 border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22] shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyzeLink}
            disabled={analyzing}
            className="px-6 py-3 rounded-2xl bg-[#FF3B7F] hover:bg-[#FF3B7F]/90 text-white font-black text-xs shadow-md shadow-[#FF3B7F]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95 transition-all"
          >
            {analyzing ? (
              <span>Analisando...</span>
            ) : (
              <>
                <span>ANALISAR LINK</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {analysisStatus && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              analysisStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : analysisStatus.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`}
          >
            {analysisStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{analysisStatus.message}</span>
          </div>
        )}
      </div>

      {/* Global Form Error */}
      {formError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Details */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Informações Principais
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Nome do Produto <span className="text-[#FF3B7F]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Robô Aspirador de Pó Inteligente Bivolt"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
              />
            </div>

            {/* Affiliate URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-[#2D1B22]">
                  Link de Afiliado Oficial <span className="text-[#FF3B7F]">* (O mais importante)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-bold">
                  Nunca modificado ou encurtado
                </span>
              </div>
              <input
                type="url"
                required
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://mercadolivre.com/sec/... ou seu link de comissão da loja"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border-2 border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-mono font-bold text-[#FF3B7F]"
              />
            </div>

            {/* Platform and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">
                  Plataforma / Loja Parceira <span className="text-[#FF3B7F]">*</span>
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformId)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
                >
                  {Object.values(PLATFORMS_CONFIG).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">
                  Categoria <span className="text-[#FF3B7F]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
                >
                  {CATEGORIES_CONFIG.filter((c) => c.id !== 'todos').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Subcategoria (opcional)
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ex: Eletroportáteis, Maquiagem, Organizadores..."
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Prices, Coupons & Installments */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Valores, Descontos & Condições
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Preço Atual (R$) <span className="text-[#FF3B7F]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 89.90"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-bold text-[#FF3B7F]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Preço Original / De (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex: 149.90"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Desconto Calculado
              </label>
              <div className="px-3.5 py-2.5 bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl text-xs font-black text-[#059669] flex items-center justify-between">
                <span>{calculatedDiscount > 0 ? `-${calculatedDiscount}% OFF` : 'Sem desconto'}</span>
                {calculatedDiscount > 0 && <Sparkles className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Cupom de Desconto (opcional)
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ex: SINARA10"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-mono font-bold text-[#4338CA]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Valor do Cupom
              </label>
              <input
                type="text"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(e.target.value)}
                placeholder="Ex: 10% OFF ou R$ 20 OFF"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Condição de Parcelamento
              </label>
              <input
                type="text"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                placeholder="Ex: 3x sem juros no cartão"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Images */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Imagens do Produto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">
                  URL da Imagem Principal <span className="text-[#FF3B7F]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... URL da foto em alta resolução"
                  className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-semibold text-[#2D1B22]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#2D1B22]">
                  Galeria de Imagens Adicionais (uma URL por linha)
                </label>
                <textarea
                  rows={3}
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="https://imagem2.jpg&#10;https://imagem3.jpg"
                  className="w-full px-3.5 py-2 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-mono text-[#2D1B22]"
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-3 bg-[#FFF8FA] border-2 border-[#FFE4E6] rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase text-slate-500 mb-2">
                Preview da Foto
              </span>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-28 h-28 object-cover rounded-xl border border-[#FFE4E6] bg-white shadow-2xs"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Humanized Curatorship (Sinara Review & Description) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#FFE4E6] pb-2">
            <Heart className="w-4 h-4 text-[#FF3B7F] fill-[#FF3B7F]" />
            <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit']">
              Curadoria & Opinião Sincera da Sinara
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Dica da Sinara (comentário carinhoso para os seguidores)
              </label>
              <textarea
                rows={3}
                value={sinaraReview}
                onChange={(e) => setSinaraReview(e.target.value)}
                placeholder="Ex: 'Gente, testei esse organizador no meu armário e coube o dobro de coisas! Vale muito a pena pelo preço.'"
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-medium text-[#2D1B22]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-[#2D1B22]">
                Descrição Técnica Curta
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Principais detalhes como medidas, voltagem, material..."
                className="w-full px-3.5 py-2.5 bg-[#FFF8FA] rounded-xl border border-[#FFE4E6] focus:border-[#FF3B7F] outline-hidden text-xs font-medium text-[#2D1B22]"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Badges & Display Options */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#FFE4E6] shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-[#2D1B22] font-['Outfit'] border-b border-[#FFE4E6] pb-2">
            Selos, Badges & Destaques
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-black text-[#2D1B22]">
              Selecione os Selos em Destaque:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_BADGES.map((b) => {
                const isSelected = selectedBadges.includes(b.id);
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => toggleBadge(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF3B7F] text-white shadow-sm shadow-[#FF3B7F]/20'
                        : 'bg-[#FFF8FA] text-slate-700 border border-[#FFE4E6] hover:border-[#FF3B7F]'
                    }`}
                  >
                    <span>{b.emoji}</span>
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#FFE4E6] grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Gold Find Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#FFE4E6] hover:bg-[#FFF8FA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGoldFind}
                  onChange={(e) => setIsGoldFind(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF3B7F] focus:ring-[#FF3B7F]"
                />
                <div>
                  <span className="text-xs font-black text-[#2D1B22] block">
                    👑 Achadinho de Ouro
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Destaque supremo na barra superior
                  </span>
                </div>
              </label>

              {/* Featured Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#FFE4E6] hover:bg-[#FFF8FA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF3B7F] focus:ring-[#FF3B7F]"
                />
                <div>
                  <span className="text-xs font-black text-[#2D1B22] block">
                    ⭐ Oferta em Destaque
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Prioridade no carrossel de ofertas
                  </span>
                </div>
              </label>

              {/* Active Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#FFE4E6] hover:bg-[#FFF8FA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-black text-emerald-700 block">
                    ✅ Produto Ativo
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Visível imediatamente para visitantes
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#FF3B7F] to-[#FF8A3B] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md shadow-[#FF3B7F]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Publicar Achadinho ✨'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
