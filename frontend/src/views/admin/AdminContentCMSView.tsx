import React, { useState } from 'react';
import { Layers, Sparkles, BookOpen, Video, Calendar, FileText } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { CmsHeroSection } from '../../components/admin/cms/CmsHeroSection';
import { CmsLinesSection } from '../../components/admin/cms/CmsLinesSection';
import { CmsDigitalCatalogSection } from '../../components/admin/cms/CmsDigitalCatalogSection';
import { CmsVideosSection } from '../../components/admin/cms/CmsVideosSection';
import { CmsEventsSection } from '../../components/admin/cms/CmsEventsSection';
import { CmsAboutSection } from '../../components/admin/cms/CmsAboutSection';

type CmsTab = 'hero' | 'lineas' | 'catalogo' | 'videos' | 'eventos' | 'quienes-somos';

export const AdminContentCMSView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CmsTab>('hero');

  const tabs = [
    { id: 'hero' as CmsTab, label: 'Hero Carrusel', icon: Layers },
    { id: 'lineas' as CmsTab, label: 'Líneas Yanbal', icon: Sparkles },
    { id: 'catalogo' as CmsTab, label: 'Catálogo Digital', icon: BookOpen },
    { id: 'videos' as CmsTab, label: 'Videos Tutoriales', icon: Video },
    { id: 'eventos' as CmsTab, label: 'Eventos & Talleres', icon: Calendar },
    { id: 'quienes-somos' as CmsTab, label: 'Quiénes Somos', icon: FileText },
  ];

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Gestor Editorial de Contenidos (CMS)
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Personalización de la Tienda & Secciones Públicas
            </h2>
            <p className="text-xs text-stone-500">
              Modifica en tiempo real textos, carruseles, videos, eventos y colecciones sin tocar código.
            </p>
          </div>
        </div>

        {/* Barra de pestañas */}
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-stone-200/80 shadow-xs overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel de Contenido Dinámico */}
        <div className="bg-stone-50/60 p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-xs">
          {activeTab === 'hero' && <CmsHeroSection />}
          {activeTab === 'lineas' && <CmsLinesSection />}
          {activeTab === 'catalogo' && <CmsDigitalCatalogSection />}
          {activeTab === 'videos' && <CmsVideosSection />}
          {activeTab === 'eventos' && <CmsEventsSection />}
          {activeTab === 'quienes-somos' && <CmsAboutSection />}
        </div>

      </div>
    </div>
  );
};
