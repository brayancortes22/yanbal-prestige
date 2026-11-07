import React, { useMemo, useState } from 'react';
import { Search, Plus, UploadCloud } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { ProductForm } from '../../components/admin/catalog/ProductForm';
import { ProductTable } from '../../components/admin/catalog/ProductTable';
import { CatalogImportModal } from '../../components/admin/CatalogImportModal';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { Product } from '../../types';

export const AdminCatalogView: React.FC = () => {
  const { products, saveProduct, toggleProductActive, deleteProduct, bulkAddProducts } = useConfig();
  const { notify } = useToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'pausados'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
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
    const isNew = !editingProduct;
    saveProduct(product);
    setIsFormOpen(false);
    setEditingProduct(null);
    notify(
      isNew
        ? `La referencia ${product.code} se agregó al catálogo.`
        : `La referencia ${product.code} se actualizó.`
    );
  };

  const handleToggle = async (id: string) => {
    const product = products.find((item) => item.id === id);
    const accepted = await confirm({
      title: product?.active ? '¿Pausar esta referencia?' : '¿Reactivar esta referencia?',
      message: product?.active
        ? `"${product.name}" dejará de mostrarse en el catálogo público, pero se conserva en el sistema.`
        : `"${product?.name || 'La referencia'}" volverá a mostrarse en el catálogo público.`,
      confirmText: product?.active ? 'Sí, pausar' : 'Sí, reactivar',
    });
    if (!accepted) return;

    toggleProductActive(id);
    notify(
      product?.active
        ? `${product.name} quedó pausado en el catálogo.`
        : `${product?.name || 'La referencia'} volvió a estar activo.`,
      'info'
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const accepted = await confirm({
      title: '¿Dar de baja esta referencia?',
      message: `"${name}" se eliminará del catálogo y también se borrarán sus fotos y videos del servidor. Los pedidos históricos conservan su nombre y precio.`,
      confirmText: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!accepted) return;
    deleteProduct(id);
    notify(`"${name}" fue eliminado del catálogo.`, 'info');
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
              Crea, edita datos, importa por CSV o activa referencias oficiales con control de inventario.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-orange-600" />
              <span>Importar Catálogo CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
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
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>

      <CatalogImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={bulkAddProducts}
      />
    </div>
  );
};
