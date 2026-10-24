import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import type { LeadProspect } from '../../types';
import { TurnstileWidget } from '../common/TurnstileWidget';

export const JoinForm: React.FC = () => {
  const [formData, setFormData] = useState<LeadProspect>({
    fullName: '',
    phone: '',
    city: '',
    roleInterest: 'consultora',
    acceptedHabeasData: false,
    trapField: '',
    turnstileToken: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.trapField && formData.trapField.trim() !== '') {
      alert('Validación de seguridad perimetral activada.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h4 className="font-editorial text-2xl font-bold text-emerald-950">
          ¡Solicitud Recibida con Éxito!
        </h4>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
          Gracias <strong>{formData.fullName}</strong>. Una Directora de Belleza Yanbal Prestige te contactará directamente por WhatsApp ({formData.phone}) para entregarte tu catálogo y darte la bienvenida.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-brand-cream/60 p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm">
      {/* CAPA 1: TRAMPA HONEYPOT INVISIBLE (Regla 8) */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="hp-field"
        value={formData.trapField}
        onChange={(e) => setFormData({ ...formData, trapField: e.target.value })}
      />

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre Completo *</label>
        <input
          type="text"
          required
          placeholder="Ej. Carolina Pérez"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp / Celular *</label>
          <input
            type="tel"
            required
            placeholder="310 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Ciudad / Municipio *</label>
          <input
            type="text"
            required
            placeholder="Ej. Neiva, Medellín, Bogotá"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">¿Qué oportunidad te interesa más? *</label>
        <select
          value={formData.roleInterest}
          onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-white text-stone-700"
        >
          <option value="consultora">Quiero ser Consultora de Belleza (Venta por Catálogo)</option>
          <option value="directora">Quiero ser Líder / Directora (Formar y Guiar mi Equipo)</option>
          <option value="cliente">Solo deseo comprar productos con asesoría personalizada</option>
        </select>
      </div>

      {/* CAPA 2: CLOUDFLARE TURNSTILE INVISIBLE (Regla 8) */}
      <TurnstileWidget onSuccess={(token) => setFormData((prev) => ({ ...prev, turnstileToken: token }))} />

      {/* Consentimiento Ley 1581 Habeas Data */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={formData.acceptedHabeasData}
            onChange={(e) => setFormData({ ...formData, acceptedHabeasData: e.target.checked })}
            className="mt-1 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-[11px] text-stone-500 leading-tight">
            Autorizo el tratamiento de mis datos personales según la <strong>Ley 1581 de 2012 (Habeas Data Colombia / SIC)</strong> para recibir asesoría del equipo y novedades de catálogo vía WhatsApp.
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Enviar Postulación al Equipo</span>
      </button>
    </form>
  );
};
