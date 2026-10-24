import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { ProductGalleryZoom } from '../components/product/ProductGalleryZoom';
import { ProductPurchaseBox } from '../components/product/ProductPurchaseBox';
import { ProductDermoTabs } from '../components/product/ProductDermoTabs';
import { RelatedProducts } from '../components/product/RelatedProducts';

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useConfig();

  const product = products.find(
    (p) => p.id === id || p.code.toLowerCase() === id?.toLowerCase()
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-brand-cream text-center space-y-4">
        <h2 className="font-editorial text-2xl font-bold text-stone-900">Referencia No Encontrada</h2>
        <p className="text-xs text-stone-500 max-w-sm">
          El producto solicitado no existe o fue descontinuado de la campaña oficial.
        </p>
        <button
          onClick={() => navigate('/catalogo')}
          className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold cursor-pointer"
        >
          Regresar al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-[85vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navegación y Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-stone-900 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link to="/catalogo" className="hover:text-stone-900 transition-colors">Catálogo</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-orange-600 font-semibold">{product.categoryLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-bold truncate max-w-[200px]">{product.name}</span>
          </div>

          <button
            onClick={() => navigate('/catalogo')}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Catálogo</span>
          </button>
        </div>

        {/* Ficha Principal: Galería con Zoom Óptico + Caja de Compra */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-6">
            <ProductGalleryZoom product={product} />
          </div>

          <div className="lg:col-span-6">
            <ProductPurchaseBox product={product} />
          </div>
        </div>

        {/* Información Dermocosmética & Rutina */}
        <ProductDermoTabs product={product} />

        {/* Productos Relacionados */}
        <RelatedProducts currentProduct={product} />

      </div>
    </div>
  );
};
