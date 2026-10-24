import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Power, Check, X } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { HeroSlide } from '../../../types';

export const CmsHeroSection: React.FC = () => {
  const { heroSlides, saveHeroSlide, toggleHeroSlide, deleteHeroSlide } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [desc, setDesc] = useState('');
  const [badge, setBadge] = useState('Lanzamiento Exclusivo');
  const [image, setImage] = useState('');

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('NUEVO LANZAMIENTO');
    setSubtitle('COLECCIÓN EXCLUSIVA');
    setDesc('Descubre la alta cosmética botánica con ingredientes naturales.');
    setBadge('Novedad');
    setImage('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80');
    setIsEditing(true);
  };

  const handleOpenEdit = (s: HeroSlide) => {
    setEditId(s.id);
    setTitle(s.title);
    setSubtitle(s.subtitle);
    setDesc(s.desc);
    setBadge(s.badge);
    setImage(s.image);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subtitle) return;
    saveHeroSlide({
      id: editId || `slide-${Date.now()}`,
      title,
      subtitle,
      desc,
      badge,
      image,
      active: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Carrusel Principal (Hero Slider)</h3>
          <p className="text-xs text-stone-500">Administra las diapositivas de apertura de la página de inicio.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Banner</span>
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="font-editorial text-sm font-bold text-stone-900">
              {editId ? 'Editar Banner Hero' : 'Crear Nuevo Banner Hero'}
            </h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Tag superior (ej: NUEVO GENACTIVE)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              required
              placeholder="Título principal (ej: SÉRUM FILLER ANTIARRUGAS)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-bold"
            />
            <input
              type="text"
              placeholder="Badge (ej: Lanzamiento Exclusivo)"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="url"
              required
              placeholder="URL de imagen de fondo"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Descripción del beneficio..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Diapositiva</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heroSlides.map((slide) => (
          <div key={slide.id} className="relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                {slide.badge}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleHeroSlide(slide.id)}
                  className={`p-1 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer ${
                    slide.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-500'
                  }`}
                  title="Activar / Desactivar"
                >
                  <Power className="w-3 h-3" />
                  <span>{slide.active ? 'Visible' : 'Pausado'}</span>
                </button>
                <button onClick={() => handleOpenEdit(slide)} className="p-1 text-stone-400 hover:text-orange-600 cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteHeroSlide(slide.id)} className="p-1 text-stone-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-orange-600 block">{slide.title}</span>
              <h4 className="font-editorial text-base font-bold text-stone-900 leading-tight">{slide.subtitle}</h4>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{slide.desc}</p>
            </div>

            <div className="h-24 rounded-xl overflow-hidden relative">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-stone-900/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
