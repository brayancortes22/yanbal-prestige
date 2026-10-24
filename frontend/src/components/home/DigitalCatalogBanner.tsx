import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const DigitalCatalogBanner: React.FC = () => {
  const navigate = useNavigate();
  const { digitalCatalog } = useConfig();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 border border-orange-200/60 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
                {digitalCatalog.badge}
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
                {digitalCatalog.title} <span className="italic font-serif text-orange-600 font-bold">{digitalCatalog.titleHighlight}</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg">
                {digitalCatalog.description}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    navigate('/catalogo');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explorar Productos del Catálogo</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative max-w-xs transform -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl rounded-2xl overflow-hidden border-4 border-white bg-white">
                <img
                  src={digitalCatalog.coverImage}
                  alt="Portada Catálogo Digital Yanbal"
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 text-center bg-stone-900 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    {digitalCatalog.specialEditionText}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {digitalCatalog.discountText}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
