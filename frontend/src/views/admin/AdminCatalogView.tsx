import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Tag, Power, Check, X } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { useConfig } from '../../context/ConfigContext';
import type { Product } from '../../types';

export const AdminCatalogView: React.FC = () => {
  const { products, saveProduct, toggleProductActive, deleteProduct } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'pausados'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Formulario Crear / Editar
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('rostro');
  const [categoryLabel, setCategoryLabel] = useState('Tratamiento Facial');
  const [price, setPrice] = useState<number>(95000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'todas' || p.category === categoryFilter;
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && p.active) ||
        (statusFilter === 'pausados' && !p.active);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleOpenCreate = () => {
    setEditId(null);
    setCode(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategory('rostro');
    setCategoryLabel('Tratamiento Facial');
    setPrice(85000);
    setOriginalPrice(110000);
    setImage('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80');
    setDescription('Producto oficial Yanbal Prestige de alta cosmética botánica.');
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditId(p.id);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setCategoryLabel(p.categoryLabel);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setImage(p.image);
    setDescription(p.description);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const existing = editId ? products.find((p) => p.id === editId) : null;
    const targetProduct: Product = {
      id: editId || `prod-${Date.now()}`,
      code,
      name,
      category,
      categoryLabel,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: image || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
      description: description || 'Producto oficial Yanbal Prestige de alta cosmética botánica.',
      usageSteps: existing?.usageSteps || ['Paso 1: Aplicar sobre piel limpia.', 'Paso 2: Masajear suavemente.'],
      consultantTip: existing?.consultantTip || 'Uso continuo recomendado para resultados óptimos.',
      active: existing ? existing.active : true,
    };

    saveProduct(targetProduct);
    setIsEditing(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`¿Deseas dar de baja definitivamente "${prodName}" del catálogo?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Gestión Integral de Referencias
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Catálogo Centralizado de Productos & SKU
            </h2>
            <p className="text-xs text-stone-500">
              Crea, edita datos, pausa o activa referencias oficiales Yanbal con control de inventario.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Formulario de Crear / Editar */}
        {isEditing && (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                {editId ? 'Editar Referencia de Catálogo' : 'Dar de Alta Nuevo Producto'}
              </h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Código SKU (ej: REF-2145)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-mono font-bold text-amber-800"
              />
              <input
                type="text"
                required
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <input
                type="number"
                required
                placeholder="Precio COP"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as Product['category'];
                  setCategory(cat);
                  const labels: Record<string, string> = {
                    rostro: 'Tratamiento Facial',
                    perfumes: 'Perfumería Fina',
                    solar: 'Protección Solar',
                    maquillaje: 'Maquillaje Funcional',
                    joyeria: 'Joyería Fina',
                  };
                  setCategoryLabel(labels[cat] || 'Cosmética');
                }}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <option value="rostro">Rostro (Tratamiento)</option>
                <option value="solar">Protección Solar</option>
                <option value="perfumes">Perfumería Fina</option>
                <option value="maquillaje">Maquillaje</option>
                <option value="joyeria">Joyería Fina</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="url"
                placeholder="URL de Imagen del Producto"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <input
                type="text"
                placeholder="Descripción concisa del producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        )}

        {/* Buscador & Filtros de Categoría y Estado */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por SKU o nombre..."
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
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todas">Todas las Categorías</option>
              <option value="rostro">Tratamiento Facial</option>
              <option value="solar">Protección Solar</option>
              <option value="perfumes">Perfumería Fina</option>
              <option value="maquillaje">Maquillaje Funcional</option>
              <option value="joyeria">Joyería Fina</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activos">Solo en Catálogo (Activos)</option>
              <option value="pausados">Solo Pausados / Agotados</option>
            </select>
          </div>
        </div>

        {/* Tabla Paginada con Botones de Editar y Eliminar Destacados */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Código / SKU</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio COP</th>
                  <th className="p-4">Estado Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-700 bg-amber-50/30 whitespace-nowrap">
                      <Tag className="w-3 h-3 inline mr-1 text-amber-600" />
                      {p.code}
                    </td>
                    <td className="p-4 font-semibold text-stone-900 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-stone-100 shrink-0" />
                      <span className={!p.active ? 'line-through text-stone-400' : ''}>{p.name}</span>
                    </td>
                    <td className="p-4 text-stone-600">{p.categoryLabel}</td>
                    <td className="p-4 font-bold text-stone-900">${p.price.toLocaleString('es-CO')}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleProductActive(p.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                          p.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Clic para pausar o activar en catálogo"
                      >
                        <Power className="w-3 h-3" />
                        <span>{p.active ? 'En Catálogo' : 'Pausado / Agotado'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 text-stone-600 hover:text-orange-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        title="Editar referencia"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar referencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>
              Mostrando {paginatedProducts.length} de {filteredProducts.length} referencias
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-900">
                Pág. {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
