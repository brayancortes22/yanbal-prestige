import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { LeadProspect } from '../../types';
import { TurnstileWidget } from '../common/TurnstileWidget';
import { api } from '../../services/api';

interface Props {
  initialRole?: string;
  onBack?: () => void;
  compact?: boolean;
}

export const JoinForm: React.FC<Props> = ({ initialRole = 'consultora', onBack, compact = false }) => {
  const [formData, setFormData] = useState<LeadProspect>({
    fullName: '',
    phone: '',
    city: '',
    roleInterest: initialRole,
    acceptedHabeasData: false,
    trapField: '',
    turnstileToken: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Honeypot: un humano nunca llena este campo. No se revela la trampa.
    if (formData.trapField && formData.trapField.trim() !== '') {
      setErrorMsg('No pudimos procesar la solicitud. Inténtalo de nuevo.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createLead(formData);
      if (!result.success) {
        setErrorMsg(result.message || 'No pudimos enviar tu postulación. Inténtalo de nuevo.');
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg('No pudimos enviar tu postulación. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h4 className="font-editorial text-xl font-bold text-emerald-950">
          ¡Postulación Recibida con Éxito!
        </h4>
        <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
          Gracias <strong>{formData.fullName}</strong>. Una Directora de Belleza Yanbal Prestige te contactará directamente por WhatsApp ({formData.phone}) para darte la bienvenida al equipo.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 cursor-pointer pt-2 inline-block"
          >
            Volver a la selección de roles
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3.5 bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-sm ${compact ? 'text-xs' : ''}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-600 transition-colors pb-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a detalles del rol</span>
        </button>
      )}

      {errorMsg && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

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
          maxLength={150}
          autoComplete="name"
          placeholder="Ej. Carolina Pérez"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp / Celular *</label>
          <input
            type="tel"
            required
            maxLength={30}
            pattern="[0-9+()\-\s]{7,30}"
            autoComplete="tel"
            placeholder="310 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Ciudad / Municipio *</label>
          <input
            type="text"
            required
            maxLength={100}
            autoComplete="address-level2"
            placeholder="Ej. Neiva, Bogotá"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">Oportunidad de Interés</label>
        <select
          value={formData.roleInterest}
          onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50 text-stone-700"
        >
          <option value="consultora">Quiero ser Consultora de Belleza (Venta por Catálogo)</option>
          <option value="directora">Quiero ser Líder / Directora (Formar y Guiar mi Equipo)</option>
          <option value="cliente">Solo deseo comprar productos con asesoría personalizada</option>
        </select>
      </div>

      {/* CAPA 2: CLOUDFLARE TURNSTILE INVISIBLE (Regla 8) */}
      <TurnstileWidget onSuccess={(token) => setFormData((prev) => ({ ...prev, turnstileToken: token }))} />

      {/* Consentimiento Ley 1581 Habeas Data */}
      <div className="pt-1">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={formData.acceptedHabeasData}
            onChange={(e) => setFormData({ ...formData, acceptedHabeasData: e.target.checked })}
            className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-[10.5px] text-stone-500 leading-tight">
            Autorizo el tratamiento de mis datos personales según la <strong>Ley 1581 de 2012 (Habeas Data Colombia)</strong> para recibir asesoría del equipo vía WhatsApp.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'Enviando Postulación...' : 'Enviar Postulación'}</span>
      </button>
    </form>
  );
};
