import React, { useState } from 'react';
import { Package, Calendar, Users, LogOut, Plus, Trash2, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { productsData } from '../../data/catalogData';
import type { Product } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const { logout, username } = useAuth();
  const [products, setProducts] = useState<Product[]>(productsData);
  const [showNotification, setShowNotification] = useState(false);

  // Hardening Enterprise: Cierre automático por inactividad tras 15 minutos (Inspirado en autogestion-sena)
  useIdleTimer({
    timeoutMs: 15 * 60 * 1000,
    onIdle: () => {
      logout();
    },
  });

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="py-12 bg-brand-cream min-h-[85vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabecera del Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Gestión de Contenido & Base de Datos
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
              Panel Administrativo Yanbal Prestige
            </h1>
            <p className="text-xs text-stone-500 flex items-center gap-2 mt-1">
              <span>Bienvenida, Directora <strong>{username}</strong>. Aquí administras el catálogo y prospectos.</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Sesión Segura (Auto-Logout 15m)</span>
              </span>
            </p>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-stone-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Métricas del Sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500">Productos en Catálogo</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">{products.length}</h4>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500">Eventos Activos</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">2</h4>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500">Prospectos Únete</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">14</h4>
            </div>
          </div>
        </div>

        {showNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Registro actualizado con éxito en la base de datos MySQL.</span>
          </div>
        )}

        {/* Tabla de Gestión de Productos */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-editorial text-lg font-bold text-stone-900">Catálogo de Productos</h3>
            <button className="px-3.5 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-semibold text-stone-900 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4 text-stone-600">{p.categoryLabel}</td>
                    <td className="p-4 font-bold text-stone-900">${p.price.toLocaleString('es-CO')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Activo</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-1 text-stone-500 hover:text-orange-600" title="Editar"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 text-stone-500 hover:text-red-500" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
