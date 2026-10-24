import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductModal } from '../components/catalog/ProductModal';
import { productsData } from '../data/catalogData';
import type { Product } from '../types';

interface CatalogViewProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (searchParams.get('cat')) {
      setSelectedCategory(searchParams.get('cat')!);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return productsData
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-12 bg-white min-h-[70vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            Colección Oficial Vigente
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
              Catálogo de Cosmética & Belleza
            </h1>
            <span className="text-xs text-stone-500 font-medium">
              Mostrando {filteredProducts.length} productos disponibles
            </span>
          </div>
        </div>

        <CatalogFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="font-editorial text-xl text-stone-700">No encontramos productos con esos filtros</p>
            <p className="text-xs text-stone-500">Prueba ajustando el término de búsqueda o selecciona otra categoría.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                onSearchChange('');
              }}
              className="mt-2 px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
