import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { ClientCard } from '../../components/consultant/ClientCard';
import { ClientForm } from '../../components/consultant/ClientForm';
import { PaginationControls } from '../../components/common/PaginationControls';
import { ClientCardSkeleton } from '../../components/common/skeletons/ClientCardSkeleton';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { ConsultantClient } from '../../types';

const PAGE_SIZE = 16;

export const ConsultantClientsView: React.FC = () => {
  const { clients, users, addClient, updateClient, deleteClient } = useConfig();
  const { email, role, username } = useAuth();
  const { notify } = useToast();
  const confirm = useConfirm();

  const currentUser =
    users.find((user) => user.email.toLowerCase() === (email || '').toLowerCase()) ||
    users.find((user) => user.name.toLowerCase() === (username || '').toLowerCase()) ||
    users.find((user) => user.role === 'CONSULTORA');

  const visibleClients = useMemo(() => {
    if (role === 'DIRECTORA' || role === 'SUPER_ADMIN') return clients;
    if (role === 'LIDER_ZONA') {
      const teamIds = new Set(
        users.filter((user) => user.leaderId === currentUser?.id).map((user) => user.id)
      );
      if (currentUser) teamIds.add(currentUser.id);
      return clients.filter((client) => client.consultantId && teamIds.has(client.consultantId));
    }
    return clients.filter((client) => client.consultantId === currentUser?.id);
  }, [clients, users, role, currentUser?.id]);

  const [searchTerm, setSearchTerm] = useState('');
  const [skinFilter, setSkinFilter] = useState('todas');
  const [catFilter, setCatFilter] = useState('todas');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Formulario Crear / Editar
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [city, setCity] = useState('Bogotá D.C.');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [skinType, setSkinType] = useState<ConsultantClient['skinType']>('Mixta');
  const [favoriteCategory, setFavoriteCategory] = useState<ConsultantClient['favoriteCategory']>('Tratamiento Facial');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setPhone('');
    setClientEmail('');
    setDocumentId('');
    setCity('Bogotá D.C.');
    setNeighborhood('');
    setAddress('');
    setPostalCode('');
    setSkinType('Mixta');
    setFavoriteCategory('Tratamiento Facial');
    setNotes('');
    setIsEditing(true);
  };

  const handleOpenEdit = (c: ConsultantClient) => {
    setEditId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setClientEmail(c.email || '');
    setDocumentId(c.documentId || '');
    setCity(c.city || 'Bogotá D.C.');
    setNeighborhood(c.neighborhood || '');
    setAddress(c.address || '');
    setPostalCode(c.postalCode || '');
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
        consultantId: existing?.consultantId ?? currentUser?.id,
        name,
        phone,
        email: clientEmail,
        documentId,
        city,
        neighborhood,
        address,
        postalCode,
        skinType,
        favoriteCategory,
        notes,
        lastContactDate: existing?.lastContactDate || new Date().toISOString().split('T')[0],
      });
    } else {
      addClient({
        consultantId: currentUser?.id,
        name,
        phone,
        email: clientEmail,
        documentId,
        city,
        neighborhood,
        address,
        postalCode,
        skinType,
        favoriteCategory,
        notes,
        lastContactDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsEditing(false);
    notify(editId ? `La ficha de ${name} se actualizó.` : `${name} se agregó a tu cartera de clientas.`);
  };

  const handleDeleteClient = async (client: ConsultantClient) => {
    const accepted = await confirm({
      title: '¿Eliminar la ficha de esta clienta?',
      message: `Se borrarán los datos de ${client.name}. Sus pedidos históricos se conservan.`,
      confirmText: 'Sí, eliminar ficha',
      tone: 'danger',
    });
    if (!accepted) return;
    deleteClient(client.id);
    notify(`La ficha de ${client.name} fue eliminada.`, 'info');
  };

  const handleMarkContactToday = (c: ConsultantClient) => {
    updateClient({ ...c, lastContactDate: new Date().toISOString().split('T')[0] });
  };

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setIsTransitioning(true);
    setter(val);
    setCurrentPage(1);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const filteredClients = useMemo(() => {
    return visibleClients.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      const matchSkin = skinFilter === 'todas' || c.skinType === skinFilter;
      const matchCat = catFilter === 'todas' || c.favoriteCategory === catFilter;
      return matchSearch && matchSkin && matchCat;
    });
  }, [visibleClients, searchTerm, skinFilter, catFilter]);

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

        {isEditing && (
          <ClientForm
            isEditing={isEditing}
            editId={editId}
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            documentId={documentId}
            setDocumentId={setDocumentId}
            city={city}
            setCity={setCity}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            address={address}
            setAddress={setAddress}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            skinType={skinType}
            setSkinType={setSkinType}
            favoriteCategory={favoriteCategory}
            setFavoriteCategory={setFavoriteCategory}
            notes={notes}
            setNotes={setNotes}
            onSubmit={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        )}

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre o celular..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
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

        {isTransitioning ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientCardSkeleton count={2} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClient}
                onMarkContactToday={handleMarkContactToday}
              />
            ))}
          </div>
        )}

        {filteredClients.length === 0 && !isTransitioning && (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 text-stone-400 text-xs">
            No se encontraron clientas registradas con los filtros seleccionados.
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="clientas"
        />
      </div>
    </div>
  );
};
