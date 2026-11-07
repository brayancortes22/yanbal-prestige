import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { MediaItem, Product } from '../../../types';
import { MediaUploader } from '../../media/MediaUploader';
import { ProductPdpFields } from './ProductPdpFields';

const CATEGORY_LABELS: Record<Product['category'], string> = {
  rostro: 'Tratamiento Facial',
  solar: 'Protección Solar',
  perfumes: 'Perfumería Fina',
  maquillaje: 'Maquillaje Funcional',
  joyeria: 'Joyería Fina',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80';

interface Props {
  product: Product | null;
  defaultCode: string;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<Props> = ({ product, defaultCode, onSave, onCancel }) => {
  const [code, setCode] = useState(product?.code ?? defaultCode);
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Product['category']>(product?.category ?? 'rostro');
  const [price, setPrice] = useState<number>(product?.price ?? 85000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(product?.originalPrice);
  const [description, setDescription] = useState(product?.description ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [media, setMedia] = useState<MediaItem[]>(
    product?.media && product.media.length > 0
      ? product.media
      : product?.image
        ? [{ id: 'cover', url: product.image, type: 'image', alt: product.name }]
        : []
  );

  // Campos PDP Editables
  const [botanicalTitle, setBotanicalTitle] = useState(product?.botanicalTitle ?? 'Fórmula Botánica');
  const [botanicalDesc, setBotanicalDesc] = useState(product?.botanicalDesc ?? 'Ingredientes activos puros');
  const [warrantyTitle, setWarrantyTitle] = useState(product?.warrantyTitle ?? '100% Original Yanbal');
  const [warrantyDesc, setWarrantyDesc] = useState(product?.warrantyDesc ?? 'Garantía oficial de fábrica');
  const [usageStepsText, setUsageStepsText] = useState((product?.usageSteps ?? [
    'Paso 1: Limpia tu rostro en la mañana y en la noche con gel o espuma suave.',
    'Paso 2: Aplica de 2 a 3 gotas en pómulos, frente y cuello.',
    'Paso 3: Realiza masajes ascendentes desde el centro hacia afuera hasta su absorción completa.'
  ]).join('\n'));
  const [consultantTip, setConsultantTip] = useState(product?.consultantTip ?? 'Aplica antes de tu crema hidratante y nunca olvides tu protector solar de día.');
  const [commitmentText, setCommitmentText] = useState(product?.commitmentText ?? 'Fórmulas no testeadas en animales (Cruelty-Free), hipoalergénicas y enriquecidas con extractos botánicos de la biodiversidad andina.');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('El código SKU y el nombre son obligatorios.');
      return;
    }
    if (price <= 0) {
      setError('El precio debe ser mayor que cero.');
      return;
    }

    const cover = media.find((item) => item.type === 'image')?.url || product?.image || FALLBACK_IMAGE;
    const parsedSteps = usageStepsText.split('\n').map((s) => s.trim()).filter(Boolean);

    onSave({
      id: product?.id ?? `prod-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      category,
      categoryLabel: CATEGORY_LABELS[category],
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: cover,
      media,
      description: description.trim() || 'Producto oficial Yanbal Prestige de alta cosmética botánica.',
      isTop: product?.isTop,
      badge: badge.trim() || undefined,
      usageSteps: parsedSteps.length > 0 ? parsedSteps : ['Paso 1: Aplicar sobre piel limpia.'],
      consultantTip: consultantTip.trim(),
      botanicalTitle: botanicalTitle.trim(),
      botanicalDesc: botanicalDesc.trim(),
      warrantyTitle: warrantyTitle.trim(),
      warrantyDesc: warrantyDesc.trim(),
      commitmentTitle: 'Compromiso Yanbal Prestige',
      commitmentText: commitmentText.trim(),
      active: product?.active ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h3 className="font-editorial text-base font-bold text-stone-900">
          {product ? 'Editar Referencia de Catálogo' : 'Dar de Alta Nuevo Producto'}
        </h3>
        <button type="button" onClick={onCancel} className="text-stone-400 hover:text-stone-700 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          required
          placeholder="Código SKU (ej: REF-2145)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-mono font-bold text-amber-800"
        />
        <input
          type="text"
          required
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="number"
          required
          min={1}
          placeholder="Precio COP"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="number"
          min={0}
          placeholder="Precio anterior (opcional)"
          value={originalPrice ?? ''}
          onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Product['category'])}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        >
          <option value="rostro">Rostro (Tratamiento)</option>
          <option value="solar">Protección Solar</option>
          <option value="perfumes">Perfumería Fina</option>
          <option value="maquillaje">Maquillaje</option>
          <option value="joyeria">Joyería Fina</option>
        </select>
        <input
          type="text"
          placeholder="Etiqueta destacada (opcional)"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Descripción concisa..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
      </div>

      <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50/40">
        <MediaUploader media={media} onChange={setMedia} maxFiles={10} label="Galería del producto" hint="Fotos y videos. La primera foto se usa como portada." />
      </div>

      <ProductPdpFields
        botanicalTitle={botanicalTitle}
        setBotanicalTitle={setBotanicalTitle}
        botanicalDesc={botanicalDesc}
        setBotanicalDesc={setBotanicalDesc}
        warrantyTitle={warrantyTitle}
        setWarrantyTitle={setWarrantyTitle}
        warrantyDesc={warrantyDesc}
        setWarrantyDesc={setWarrantyDesc}
        usageStepsText={usageStepsText}
        setUsageStepsText={setUsageStepsText}
        consultantTip={consultantTip}
        setConsultantTip={setConsultantTip}
        commitmentText={commitmentText}
        setCommitmentText={setCommitmentText}
      />

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer">
          Cancelar
        </button>
        <button type="submit" className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer">
          <Check className="w-3.5 h-3.5" />
          <span>Guardar Cambios</span>
        </button>
      </div>
    </form>
  );
};
