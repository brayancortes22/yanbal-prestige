import React, { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { ProductForm } from '../../components/admin/catalog/ProductForm';
import { ProductTable } from '../../components/admin/catalog/ProductTable';
import { useConfig } from '../../context/ConfigContext';
import type { Product } from '../../types';

export const AdminCatalogView: React.FC = () => {
  const { products, saveProduct, toggleProductActive, deleteProduct } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'pausados'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [suggestedCode, setSuggestedCode] = useState('REF-0000');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        product.name.toLowerCase().includes(term) || product.code.toLowerCase().includes(term);
      const matchCategory = categoryFilter === 'todas' || product.category === categoryFilter;
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && product.active) ||
        (statusFilter === 'pausados' && !product.active);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSuggestedCode(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSave = (product: Product) => {
    saveProduct(product);
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Gestión Integral de Referencias
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Catálogo Centralizado de Productos & SKU
            </h2>
            <p className="text-xs text-stone-500">
              Crea, edita datos, pausa o activa referencias oficiales Yanbal con control de
              inventario.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {isFormOpen && (
          <ProductForm
            product={editingProduct}
            defaultCode={suggestedCode}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por SKU o nombre..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
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
              onChange={(event) =>
                setStatusFilter(event.target.value as 'todos' | 'activos' | 'pausados')
              }
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activos">Solo en Catálogo (Activos)</option>
              <option value="pausados">Solo Pausados / Agotados</option>
            </select>
          </div>
        </div>

        <ProductTable
          products={filteredProducts}
          onEdit={handleOpenEdit}
          onToggle={toggleProductActive}
          onDelete={(id, name) => {
            if (confirm(`¿Deseas dar de baja definitivamente "${name}" del catálogo?`)) {
              deleteProduct(id);
            }
          }}
        />
      </div>
    </div>
  );
};
