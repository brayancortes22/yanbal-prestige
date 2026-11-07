import React from 'react';
import type { ConsultantClient } from '../../types';
import { SearchableSelect } from '../common/SearchableSelect';
import { PostalCodeField } from '../common/PostalCodeField';

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
  clientEmail: string;
  setClientEmail: (v: string) => void;
  clientDocumentId: string;
  setClientDocumentId: (v: string) => void;
  clientCity: string;
  setClientCity: (c: string) => void;
  clientNeighborhood: string;
  setClientNeighborhood: (v: string) => void;
  clientAddress: string;
  setClientAddress: (a: string) => void;
  clientPostalCode: string;
  setClientPostalCode: (v: string) => void;
}

const inputClass =
  'w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-brand-apricot focus:outline-none';

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
  clientEmail,
  setClientEmail,
  clientDocumentId,
  setClientDocumentId,
  clientCity,
  setClientCity,
  clientNeighborhood,
  setClientNeighborhood,
  clientAddress,
  setClientAddress,
  clientPostalCode,
  setClientPostalCode,
}) => {
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  return (
    <div className="space-y-3">
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
        <div className="space-y-1">
          <SearchableSelect
            options={clients.map((client) => ({
              value: client.id,
              label: client.name,
              hint: `${client.phone}${client.email ? ` · ${client.email}` : ''} · Piel ${client.skinType}`,
              keywords: `${client.favoriteCategory} ${client.notes}`,
            }))}
            value={selectedClientId}
            onChange={setSelectedClientId}
            placeholder={`Buscar entre ${clients.length} clientas de mi CRM...`}
            emptyMessage="No hay clientas que coincidan. Regístrala como Nueva Clienta."
          />
          <p className="px-1 text-[10px] text-stone-400">
            Al elegirla se completan sus datos de contacto y despacho guardados.
          </p>
          {selectedClient && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] text-emerald-900">
              <p className="font-bold">Datos cargados del CRM</p>
              <p>
                {selectedClient.name} · {selectedClient.phone}
                {selectedClient.email ? ` · ${selectedClient.email}` : ' · sin correo'}
              </p>
              <p>
                {[
                  selectedClient.city,
                  selectedClient.neighborhood,
                  selectedClient.address,
                  selectedClient.postalCode ? `CP ${selectedClient.postalCode}` : '',
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Sin dirección registrada'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre completo *"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (+57 ...) *"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="email"
            placeholder="Correo para enviar la factura"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Cédula / NIT (opcional)"
            value={clientDocumentId}
            onChange={(e) => setClientDocumentId(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Ciudad / Municipio"
          value={clientCity}
          onChange={(e) => setClientCity(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Barrio / Localidad"
          value={clientNeighborhood}
          onChange={(e) => setClientNeighborhood(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Dirección (calle, carrera, apto)"
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
          className={inputClass}
        />
        <PostalCodeField value={clientPostalCode} onChange={setClientPostalCode} />
      </div>
    </div>
  );
};
