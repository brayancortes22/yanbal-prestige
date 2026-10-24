import React, { useState } from 'react';
import { Search, Tag, Lightbulb, Copy, Check } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { useConfig } from '../../context/ConfigContext';

export const ConsultantCatalogView: React.FC = () => {
  const { products } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por Cód (ej: REF-2145) o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover border border-stone-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{product.code}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(product.code)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                      title="Copiar Código"
                    >
                      {copiedCode === product.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h4 className="font-semibold text-xs text-stone-900 truncate mt-1">{product.name}</h4>
                  <span className="text-[11px] text-stone-400">{product.categoryLabel}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-500">Precio Oficial:</span>
                <span className="font-editorial text-base font-bold text-stone-900">
                  ${product.price.toLocaleString('es-CO')} COP
                </span>
              </div>

              {product.consultantTip && (
                <div className="p-2 rounded-xl bg-orange-50/60 border border-orange-100 text-[10px] text-orange-950 flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-orange-600 shrink-0 mt-0.5" />
                  <span>{product.consultantTip}</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
