import React from 'react';
import type { ConsultantClient } from '../../types';

interface DirectSaleClientFieldsProps {
  clientMode: 'crm' | 'nuevo';
  setClientMode: (m: 'crm' | 'nuevo') => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  clients: ConsultantClient[];
  clientName: string;
  setClientName: (n: string) => void;
  clientPhone: string;
  setClientPhone: (p: string) => void;
  clientCity: string;
  setClientCity: (c: string) => void;
  clientAddress: string;
  setClientAddress: (a: string) => void;
}

export const DirectSaleClientFields: React.FC<DirectSaleClientFieldsProps> = ({
  clientMode,
  setClientMode,
  selectedClientId,
  setSelectedClientId,
  clients,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientCity,
  setClientCity,
  clientAddress,
  setClientAddress,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setClientMode('crm')}
          className={`flex-1 py-1.5 rounded-xl font-medium border ${clientMode === 'crm' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
        >
          Clienta de mi CRM
        </button>
        <button
          type="button"
          onClick={() => setClientMode('nuevo')}
          className={`flex-1 py-1.5 rounded-xl font-medium border ${clientMode === 'nuevo' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
        >
          Nueva Clienta
        </button>
      </div>

      {clientMode === 'crm' ? (
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.phone} ({c.skinType})</option>
          ))}
        </select>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nombre completo"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50"
            required
          />
          <input
            type="text"
            placeholder="Teléfono WhatsApp (+57 ...)"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Ciudad"
          value={clientCity}
          onChange={(e) => setClientCity(e.target.value)}
          className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Dirección / Barrio"
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
          className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50"
        />
      </div>
    </div>
  );
};
