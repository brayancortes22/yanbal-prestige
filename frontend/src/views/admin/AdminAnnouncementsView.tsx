import React, { useState } from 'react';
import { Megaphone, Save, CheckCircle, Bell, MessageCircle } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { useConfig } from '../../context/ConfigContext';

export const AdminAnnouncementsView: React.FC = () => {
  const { announcements, setAnnouncements } = useConfig();
  const [formData, setFormData] = useState(announcements);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncements({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Personalización de la Tienda
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Gestión de Anuncios del Inicio & Banners
            </h2>
            <p className="text-xs text-stone-500">
              Modifica en tiempo real la barra superior de campaña, promociones vigentes y mensajes de WhatsApp.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Los anuncios han sido actualizados en la tienda pública sin recargar el servidor.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          {/* Anuncio Superior MAYA */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-orange-600" />
              <span>Texto de la Barra Superior de Anuncios (Header)</span>
            </label>
            <textarea
              rows={2}
              value={formData.topBannerText}
              onChange={(e) => setFormData({ ...formData, topBannerText: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-stone-50/50"
              placeholder="Ej: Campaña 05 Yanbal: Envíos gratis por compras superiores a $150.000 COP..."
            />
            <p className="text-[11px] text-stone-400">
              Este texto se muestra en la franja superior oscura de todas las páginas del portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">Nombre de Campaña Vigente</label>
              <input
                type="text"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-stone-50/50"
                placeholder="Ej: Campaña 05 - Esencia & Cuidado"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">Texto Promocional Destacado</label>
              <input
                type="text"
                value={formData.campaignDiscountText}
                onChange={(e) => setFormData({ ...formData, campaignDiscountText: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-stone-50/50"
                placeholder="Ej: Hasta 35% OFF en Línea Sentiva..."
              />
            </div>
          </div>

          {/* Mensaje de WhatsApp por Defecto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Mensaje Predeterminado al Iniciar Chat de WhatsApp</span>
            </label>
            <input
              type="text"
              value={formData.whatsAppWelcomeMsg}
              onChange={(e) => setFormData({ ...formData, whatsAppWelcomeMsg: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-stone-50/50"
            />
          </div>

          {/* Vista previa en vivo */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Vista Previa en Vivo (Header)
            </span>
            <div className="text-xs font-medium text-stone-200 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{formData.topBannerText}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Publicar Anuncios</span>
          </button>
        </form>

      </div>
    </div>
  );
};
