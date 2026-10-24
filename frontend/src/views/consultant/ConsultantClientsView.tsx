import React, { useState } from 'react';
import { Plus, MessageCircle, Trash2, Search } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { useConfig } from '../../context/ConfigContext';
import type { ConsultantClient } from '../../types';

export const ConsultantClientsView: React.FC = () => {
  const { clients, addClient, deleteClient } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skinType, setSkinType] = useState<ConsultantClient['skinType']>('Mixta');
  const [favoriteCategory, setFavoriteCategory] = useState<ConsultantClient['favoriteCategory']>('Tratamiento Facial');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addClient({
      name,
      phone,
      skinType,
      favoriteCategory,
      notes,
      lastContactDate: new Date().toISOString().split('T')[0],
    });
    setName('');
    setPhone('');
    setNotes('');
    setShowAddForm(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block">
              Fidelización & CRM Personal (Estilo Accesorios Lilís)
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Mis Clientas & Rutinas Recomendadas
            </h2>
            <p className="text-xs text-stone-500">
              Registra sus preferencias de piel y contáctalas por WhatsApp con recomendaciones personalizadas.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancelar' : 'Nueva Clienta'}</span>
          </button>
        </div>

        {/* Formulario desplegable para nueva clienta */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-editorial text-base font-bold text-stone-900">Registrar Ficha de Clienta</h3>
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
                placeholder="WhatsApp (ej: +57 312...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value as any)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <option value="Normal">Piel Normal</option>
                <option value="Grasa">Piel Grasa</option>
                <option value="Mixta">Piel Mixta</option>
                <option value="Seca">Piel Seca</option>
                <option value="Sensible">Piel Sensible</option>
              </select>
              <select
                value={favoriteCategory}
                onChange={(e) => setFavoriteCategory(e.target.value as any)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <option value="Tratamiento Facial">Tratamiento Facial</option>
                <option value="Perfumería">Perfumería</option>
                <option value="Protección Solar">Protección Solar</option>
                <option value="Maquillaje">Maquillaje</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Notas de preferencia (ej: Le gusta el perfume floral dulce o suero antiedad)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs">
              Guardar Clienta en mi CRM
            </button>
          </form>
        )}

        {/* Buscador */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white"
          />
        </div>

        {/* Lista de Fichas de Clientas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-editorial text-base font-bold text-stone-900">{client.name}</h4>
                  <span className="text-xs text-stone-400 font-mono">{client.phone}</span>
                </div>
                <button onClick={() => deleteClient(client.id)} className="text-stone-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                  Piel {client.skinType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                  {client.favoriteCategory}
                </span>
              </div>

              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                {client.notes}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <span className="text-[10px] text-stone-400">Último contacto: {client.lastContactDate}</span>
                <a
                  href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(client.name)}%2C%20te%20escribe%20tu%20Consultora%20de%20Belleza%20Yanbal.%20Tengo%20una%20oferta%20especial%20en%20tu%20categor%C3%ADa%20favorita%20(${encodeURIComponent(client.favoriteCategory)})...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Asesorar por WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
