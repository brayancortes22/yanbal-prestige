import React, { useState } from 'react';
import { Edit3, Check, X, Plus, Shuffle, Trash2, RotateCw } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { LineAccordionItem, MediaItem } from '../../../types';
import { MediaUploader } from '../../media/MediaUploader';

export const CmsLinesSection: React.FC = () => {
  const { linesAccordion, saveLineAccordion, deleteLineAccordion, products } = useConfig();
  const [editingLine, setEditingLine] = useState<LineAccordionItem | null>(null);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageMedia, setImageMedia] = useState<MediaItem[]>([]);
  const [claimsStr, setClaimsStr] = useState('');
  const [pinnedProductId, setPinnedProductId] = useState('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<LineAccordionItem['categoryFilter']>('rostro');

  const handleOpenEdit = (line: LineAccordionItem) => {
    setEditingLine(line);
    setTitle(line.title);
    setTagline(line.tagline);
    setDescription(line.description);
    setImage(line.image);
    setImageMedia(
      line.image ? [{ id: 'cover', url: line.image, type: 'image', alt: line.title }] : []
    );
    setClaimsStr(line.claims.join(', '));
    setPinnedProductId(line.pinnedProductId || '');
    setAutoRotate(Boolean(line.autoRotate));
    setCategoryFilter(line.categoryFilter);
  };

  const handleOpenCreate = () => {
    const newLine: LineAccordionItem = {
      id: `line-${Date.now()}`,
      title: '',
      tagline: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      claims: ['Alta Cosmética', 'Fórmula Yanbal'],
      categoryFilter: 'rostro',
      autoRotate: true,
    };
    handleOpenEdit(newLine);
  };

  const handleRandomProduct = () => {
    if (products.length === 0) return;
    const matching = products.filter((p) => p.category === categoryFilter);
    const pool = matching.length > 0 ? matching : products;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setPinnedProductId(random.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLine) return;

    const claims = claimsStr.split(',').map((c) => c.trim()).filter(Boolean);
    saveLineAccordion({
      ...editingLine,
      title,
      tagline,
      description,
      image,
      categoryFilter,
      claims: claims.length > 0 ? claims : ['Calidad Yanbal'],
      pinnedProductId: pinnedProductId || undefined,
      autoRotate,
    });
    setEditingLine(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (linesAccordion.length <= 1) {
      alert('Debe existir al menos una colección en la página principal.');
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar la colección "${name}"?`)) {
      deleteLineAccordion(id);
      if (editingLine?.id === id) setEditingLine(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Líneas Emblemáticas Yanbal</h3>
          <p className="text-xs text-stone-500">Colecciones destacadas en portada, claims clínicos y rotación de productos.</p>
        </div>
        <button
          id="btn-new-line"
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Colección</span>
        </button>
      </div>

      {editingLine && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="font-editorial text-sm font-bold text-stone-900">
              {editingLine.title ? `Editar: ${editingLine.title}` : 'Nueva Colección'}
            </h4>
            <button type="button" onClick={() => setEditingLine(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Título de la línea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-bold"
            />
            <input
              type="text"
              required
              placeholder="Tagline / Subtítulo"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as LineAccordionItem['categoryFilter'])}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
            >
              <option value="rostro">Categoría: Rostro</option>
              <option value="perfumes">Categoría: Perfumes</option>
              <option value="maquillaje">Categoría: Maquillaje</option>
              <option value="joyeria">Categoría: Joyería</option>
              <option value="solar">Categoría: Protección Solar</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50/40">
            <MediaUploader
              media={imageMedia}
              onChange={(next) => {
                setImageMedia(next);
                setImage(next[0]?.url || '');
              }}
              accept="image"
              maxFiles={1}
              subFolder="lines"
              label="Fotografía de la línea"
              hint="Sube una foto vertical u horizontal de la colección."
              showAlt={false}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-stone-700">
                Producto fijado de la línea
              </label>
              <button
                type="button"
                onClick={handleRandomProduct}
                className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Seleccionar un producto al azar"
              >
                <Shuffle className="w-3 h-3" />
                <span>Asignar Aleatorio</span>
              </button>
            </div>
            <select
              value={pinnedProductId}
              onChange={(e) => setPinnedProductId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            >
              <option value="">Automático: el más vendido de la categoría</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.code} · {product.categoryLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Switch de Rotación Automática */}
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-stone-800 block">Rotación Automática en Portada</span>
                <span className="text-[10px] text-stone-500">Alternar periódicamente los productos destacados de esta colección</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <textarea
            rows={2}
            placeholder="Descripción de la colección..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Beneficios Clínicos (separados por coma)</label>
            <input
              type="text"
              placeholder="Ej: SPF 100, Sin Residuo Blanco, Resistente al Agua"
              value={claimsStr}
              onChange={(e) => setClaimsStr(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingLine(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Colección</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {linesAccordion.map((line) => (
          <div key={line.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex gap-4 items-center">
            <img src={line.image} alt={line.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-orange-600">{line.tagline || 'Colección'}</span>
                {line.autoRotate && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-100 text-orange-800 font-semibold flex items-center gap-0.5">
                    <RotateCw className="w-2.5 h-2.5" /> Auto
                  </span>
                )}
              </div>
              <h4 className="font-editorial text-sm font-bold text-stone-900 truncate">{line.title}</h4>
              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{line.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                id={`btn-edit-line-${line.id}`}
                type="button"
                onClick={() => handleOpenEdit(line)}
                className="p-2 text-stone-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer"
                title="Editar colección"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(line.id, line.title)}
                className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Eliminar colección"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
