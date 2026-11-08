import React from 'react';
import { X, Check } from 'lucide-react';
import { PostalCodeField } from '../common/PostalCodeField';
import type { ConsultantClient } from '../../types';

interface ClientFormProps {
  isEditing: boolean;
  editId: string | null;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  clientEmail: string;
  setClientEmail: (v: string) => void;
  documentId: string;
  setDocumentId: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  neighborhood: string;
  setNeighborhood: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  skinType: ConsultantClient['skinType'];
  setSkinType: (v: ConsultantClient['skinType']) => void;
  favoriteCategory: ConsultantClient['favoriteCategory'];
  setFavoriteCategory: (v: ConsultantClient['favoriteCategory']) => void;
  notes: string;
  setNotes: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  editId,
  name,
  setName,
  phone,
  setPhone,
  clientEmail,
  setClientEmail,
  documentId,
  setDocumentId,
  city,
  setCity,
  neighborhood,
  setNeighborhood,
  address,
  setAddress,
  postalCode,
  setPostalCode,
  skinType,
  setSkinType,
  favoriteCategory,
  setFavoriteCategory,
  notes,
  setNotes,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-amber-300 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h3 className="font-editorial text-base font-bold text-stone-900">
          {editId ? 'Editar Ficha de Clienta' : 'Registrar Ficha de Clienta'}
        </h3>
        <button type="button" onClick={onCancel} className="text-stone-400 hover:text-stone-700 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          required
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          required
          placeholder="Celular / WhatsApp (ej. 3001234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="email"
          placeholder="Correo electrónico (opcional)"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Cédula / Documento (opcional)"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Ciudad (ej. Bogotá D.C.)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Barrio / Sector (opcional)"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Dirección de entrega (opcional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <PostalCodeField
          value={postalCode}
          onChange={setPostalCode}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <select
          value={skinType}
          onChange={(e) => setSkinType(e.target.value as ConsultantClient['skinType'])}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700"
        >
          <option value="Normal">Piel Normal</option>
          <option value="Grasa">Piel Grasa</option>
          <option value="Mixta">Piel Mixta</option>
          <option value="Seca">Piel Seca</option>
          <option value="Sensible">Piel Sensible</option>
        </select>
        <select
          value={favoriteCategory}
          onChange={(e) => setFavoriteCategory(e.target.value as ConsultantClient['favoriteCategory'])}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700"
        >
          <option value="Tratamiento Facial">Tratamiento Facial</option>
          <option value="Perfumería">Perfumería</option>
          <option value="Protección Solar">Protección Solar</option>
          <option value="Maquillaje">Maquillaje</option>
          <option value="Joyería Fina">Joyería Fina</option>
        </select>
        <input
          type="text"
          placeholder="Notas o gustos de la clienta..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 sm:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer hover:bg-stone-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-stone-800"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{editId ? 'Actualizar Ficha' : 'Guardar Clienta en mi CRM'}</span>
        </button>
      </div>
    </form>
  );
};
