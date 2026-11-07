import React, { useState } from 'react';
import { Save, CheckCircle, Camera, MessageCircle, Music2, Mail } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

const inputClass =
  'mt-0.5 w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs focus:border-orange-400 focus:outline-none';

export const CmsFooterSection: React.FC = () => {
  const { footerConfig, setFooterConfig } = useConfig();
  const [form, setForm] = useState(footerConfig);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFooterConfig({ ...form, updatedAt: new Date().toISOString() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">
          Redes sociales y contacto del pie de página
        </h3>
        <p className="text-xs text-stone-500">
          Estos enlaces son los iconos de WhatsApp, Instagram y TikTok que aparecen al final de
          todas las páginas.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
          <CheckCircle className="h-3.5 w-3.5" /> Pie de página actualizado.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex items-start gap-2 text-[10px] font-bold uppercase text-stone-500">
          <MessageCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="flex-1">
            Enlace de WhatsApp
            <input
              type="url"
              value={form.whatsappUrl}
              onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
              placeholder="https://wa.me/573001234567"
              className={inputClass}
            />
          </span>
        </label>

        <label className="flex items-start gap-2 text-[10px] font-bold uppercase text-stone-500">
          <Camera className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-600" />
          <span className="flex-1">
            Enlace de Instagram
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/tu_cuenta"
              className={inputClass}
            />
          </span>
        </label>

        <label className="flex items-start gap-2 text-[10px] font-bold uppercase text-stone-500">
          <Music2 className="mt-1 h-3.5 w-3.5 shrink-0 text-stone-700" />
          <span className="flex-1">
            Enlace de TikTok
            <input
              type="url"
              value={form.tiktokUrl}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@tu_cuenta"
              className={inputClass}
            />
          </span>
        </label>

        <label className="flex items-start gap-2 text-[10px] font-bold uppercase text-stone-500">
          <Mail className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-600" />
          <span className="flex-1">
            Correo de contacto
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="contacto@yanbalprestige.com"
              className={inputClass}
            />
          </span>
        </label>
      </div>

      <label className="block text-[10px] font-bold uppercase text-stone-500">
        Aviso legal del pie de página
        <textarea
          rows={4}
          value={form.legalNote}
          onChange={(e) => setForm({ ...form, legalNote: e.target.value })}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-stone-800"
      >
        <Save className="h-3.5 w-3.5" /> Guardar pie de página
      </button>
    </form>
  );
};
