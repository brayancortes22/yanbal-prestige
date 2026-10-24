import React, { useState, useMemo } from 'react';
import { Plus, MessageCircle, Trash2, Search, Edit3, X, Check, CalendarCheck } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { ClientCardSkeleton } from '../../components/common/skeletons/ClientCardSkeleton';
import { useConfig } from '../../context/ConfigContext';
import type { ConsultantClient } from '../../types';

export const ConsultantClientsView: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [skinFilter, setSkinFilter] = useState('todas');
  const [catFilter, setCatFilter] = useState('todas');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Formulario Crear / Editar
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skinType, setSkinType] = useState<ConsultantClient['skinType']>('Mixta');
  const [favoriteCategory, setFavoriteCategory] = useState<ConsultantClient['favoriteCategory']>('Tratamiento Facial');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setPhone('');
    setSkinType('Mixta');
    setFavoriteCategory('Tratamiento Facial');
    setNotes('');
    setIsEditing(true);
  };

  const handleOpenEdit = (c: ConsultantClient) => {
    setEditId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setSkinType(c.skinType);
    setFavoriteCategory(c.favoriteCategory);
    setNotes(c.notes);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editId) {
      const existing = clients.find((c) => c.id === editId);
      updateClient({
        id: editId,
        name,
        phone,
        skinType,
        favoriteCategory,
        notes,
        lastContactDate: existing?.lastContactDate || new Date().toISOString().split('T')[0],
      });
    } else {
      addClient({
        name,
        phone,
        skinType,
        favoriteCategory,
        notes,
        lastContactDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsEditing(false);
  };

  const handleMarkContactToday = (c: ConsultantClient) => {
    updateClient({
      ...c,
      lastContactDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setIsTransitioning(true);
    setter(val);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
      const matchSkin = skinFilter === 'todas' || c.skinType === skinFilter;
      const matchCat = catFilter === 'todas' || c.favoriteCategory === catFilter;
      return matchSearch && matchSkin && matchCat;
    });
  }, [clients, searchTerm, skinFilter, catFilter]);

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block">
              Fidelización & CRM Personal
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Mis Clientas & Rutinas Recomendadas
            </h2>
            <p className="text-xs text-stone-500">
              Registra preferencias dermatológicas, edita fichas y mantén contacto directo por WhatsApp.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Clienta</span>
          </button>
        </div>

        {/* Formulario Crear / Editar */}
        {isEditing && (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                {editId ? 'Editar Ficha de Clienta' : 'Registrar Ficha de Clienta'}
              </h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
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
                <option value="Joyería Fina">Joyería Fina</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Notas de preferencia (ej: Le gusta el perfume floral dulce o suero antiedad)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                className="px-5 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editId ? 'Actualizar Ficha' : 'Guardar Clienta en mi CRM'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Buscador & Filtros de CRM */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre o celular..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={skinFilter}
              onChange={(e) => handleFilterChange(setSkinFilter, e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todas">Todos los Tipos de Piel</option>
              <option value="Normal">Piel Normal</option>
              <option value="Grasa">Piel Grasa</option>
              <option value="Mixta">Piel Mixta</option>
              <option value="Seca">Piel Seca</option>
              <option value="Sensible">Piel Sensible</option>
            </select>

            <select
              value={catFilter}
              onChange={(e) => handleFilterChange(setCatFilter, e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todas">Todas las Preferencias</option>
              <option value="Tratamiento Facial">Tratamiento Facial</option>
              <option value="Perfumería">Perfumería</option>
              <option value="Protección Solar">Protección Solar</option>
              <option value="Maquillaje">Maquillaje</option>
              <option value="Joyería Fina">Joyería Fina</option>
            </select>
          </div>
        </div>

        {/* Lista de Fichas de Clientas */}
        {isTransitioning ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientCardSkeleton count={2} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map((client) => {
              const wpMsg = encodeURIComponent(
                `Hola ${client.name}! Te escribo de Yanbal Prestige. Vi que tu categoría favorita es ${client.favoriteCategory} y tenemos novedades ideales para tu piel ${client.skinType.toLowerCase()}. ¿Te gustaría conocer las promociones de esta campaña?`
              );
              const cleanPhone = client.phone.replace(/[^0-9]/g, '');

              return (
                <div key={client.id} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-editorial text-base font-bold text-stone-900">{client.name}</h4>
                      <span className="text-xs text-stone-400 font-mono">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                        title="Editar ficha"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la ficha de ${client.name}?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        className="p-1.5 text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar ficha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      Piel {client.skinType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                      {client.favoriteCategory}
                    </span>
                  </div>

                  {client.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
                      {client.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span>Último contacto: {client.lastContactDate}</span>
                      <button
                        onClick={() => handleMarkContactToday(client)}
                        title="Marcar contacto hoy"
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${wpMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Asesorar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredClients.length === 0 && !isTransitioning && (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 text-stone-400 text-xs">
            No se encontraron clientas registradas con los filtros seleccionados.
          </div>
        )}

      </div>
    </div>
  );
};
