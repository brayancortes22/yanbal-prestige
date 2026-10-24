import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import type { Product } from '../../types';

interface Props {
  currentProduct: Product;
}

export const RelatedProducts: React.FC<Props> = ({ currentProduct }) => {
  const navigate = useNavigate();
  const { products } = useConfig();

  const related = products
    .filter((p) => p.id !== currentProduct.id && (p.category === currentProduct.category || p.isTop))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 block">
            Rutina Complementaria
          </span>
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Completa tu Tratamiento
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((prod) => (
          <div
            key={prod.id}
            onClick={() => {
              navigate(`/producto/${prod.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group card-luxury p-3 rounded-2xl bg-white border border-stone-200/80 cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-stone-50">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div>
              <span className="text-[10px] text-orange-600 font-semibold uppercase block truncate">
                {prod.categoryLabel}
              </span>
              <h4 className="font-editorial text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {prod.name}
              </h4>
              <span className="text-xs font-bold text-stone-900 mt-1 block">
                ${prod.price.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
