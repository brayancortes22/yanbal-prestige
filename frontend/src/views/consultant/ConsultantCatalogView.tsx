import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { ConsultantCatalogTable } from '../../components/consultant/ConsultantCatalogTable';
import { PaginationControls } from '../../components/common/PaginationControls';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { Product } from '../../types';

const PAGE_SIZE = 15;

export const ConsultantCatalogView: React.FC = () => {
  const { products } = useConfig();
  const { notify } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(term));
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleCopyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedCode(code);
    notify(`Código SKU ${code} copiado al portapapeles.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyQuote = (product: Product) => {
    const quoteText = `✨ *${product.name}* (Ref: ${product.code})\n💰 Precio Especial: $${product.price.toLocaleString('es-CO')} COP${product.originalPrice && product.originalPrice > product.price ? ` (Antes: $${product.originalPrice.toLocaleString('es-CO')})` : ''}\n📦 Envío seguro a todo Colombia con Yanbal Prestige.`;
    void navigator.clipboard.writeText(quoteText);
    setCopiedQuoteId(product.id);
    notify('Datos del producto copiados para enviar a tu clienta.');
    setTimeout(() => setCopiedQuoteId(null), 2500);
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ConsultantNav />

        {/* Cabecera y Buscador */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block">
              Consulta Inmediata para Ventas
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Buscador Rápido de Códigos SKU Yanbal
            </h2>
            <p className="text-xs text-stone-500">
              Cotiza en segundos durante tus llamadas o chats con clientas con el código oficial de campaña.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por Cód (ej: REF-2145) o producto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-400 hidden sm:inline" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-medium text-stone-700 focus:outline-hidden"
              >
                <option value="ALL">Todas las líneas</option>
                <option value="rostro">Tratamiento Facial / Rostro</option>
                <option value="perfumes">Perfumería Fina</option>
                <option value="maquillaje">Maquillaje</option>
                <option value="joyeria">Joyería Artesanal</option>
                <option value="solar">Protección Solar Total Block</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla Institucional de SKUs */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-editorial text-base font-bold text-stone-900">
              Catálogo de Productos ({filtered.length})
            </span>
            <span className="text-stone-500 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              Precios oficiales de campaña
            </span>
          </div>

          <ConsultantCatalogTable
            products={paginatedProducts}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
            onCopyQuote={handleCopyQuote}
            copiedQuoteId={copiedQuoteId}
          />
        </div>

        {/* Paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="productos"
        />
      </div>
    </div>
  );
};
