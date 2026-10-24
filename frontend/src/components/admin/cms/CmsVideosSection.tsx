import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Power, Check, X } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { VideoTipItem } from '../../../types';

export const CmsVideosSection: React.FC = () => {
  const { videoTips, saveVideoTip, toggleVideoTip, deleteVideoTip } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('2:00 min');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setDuration('1:45 min');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80');
    setIsEditing(true);
  };

  const handleOpenEdit = (v: VideoTipItem) => {
    setEditId(v.id);
    setTitle(v.title);
    setDuration(v.duration);
    setDescription(v.description);
    setImage(v.image);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    saveVideoTip({
      id: editId || `v-${Date.now()}`,
      title,
      duration,
      description,
      image,
      active: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Sección de Videos y Tutoriales</h3>
          <p className="text-xs text-stone-500">Publica guías de aplicación dermatológica y rutinas de belleza.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Video</span>
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="font-editorial text-sm font-bold text-stone-900">
              {editId ? 'Editar Video Tutorial' : 'Agregar Nuevo Video'}
            </h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Título del video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Duración (ej: 2:10 min)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <input
            type="url"
            required
            placeholder="URL de imagen miniatura"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <textarea
            rows={2}
            placeholder="Descripción del video..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <div className="flex justify-end gap-2 pt-1">
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
              <span>Guardar Video</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videoTips.map((vid) => (
          <div key={vid.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img src={vid.image} alt={vid.title} className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {vid.duration}
              </span>
            </div>

            <div>
              <h4 className="font-editorial text-sm font-bold text-stone-900">{vid.title}</h4>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{vid.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                onClick={() => toggleVideoTip(vid.id)}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer ${
                  vid.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{vid.active ? 'Visible' : 'Pausado'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenEdit(vid)} className="p-1 text-stone-400 hover:text-orange-600 cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteVideoTip(vid.id)} className="p-1 text-stone-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
