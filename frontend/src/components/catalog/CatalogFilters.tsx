import React from 'react';
import { Search } from 'lucide-react';

interface CatalogFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}) => {
  const categories = [
    { id: 'all', label: 'Todos los Productos' },
    { id: 'rostro', label: 'Tratamiento Facial' },
    { id: 'solar', label: 'Protección Solar' },
    { id: 'perfumes', label: 'Perfumería Fina' },
    { id: 'maquillaje', label: 'Maquillaje' },
    { id: 'joyeria', label: 'Joyería Fina' }
  ];

  return (
    <div className="space-y-6">
      {/* Fila Superior: Buscador y Ordenamiento */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o línea..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-stone-500 font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 rounded-full border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="default">Recomendados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Pills de Categoría Horizontales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
