import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Sparkles, BookOpen, Video, Calendar, FileText, Lightbulb, Briefcase, Scale, Share2 } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { CmsHeroSection } from '../../components/admin/cms/CmsHeroSection';
import { CmsLinesSection } from '../../components/admin/cms/CmsLinesSection';
import { CmsDigitalCatalogSection } from '../../components/admin/cms/CmsDigitalCatalogSection';
import { CmsVideosSection } from '../../components/admin/cms/CmsVideosSection';
import { CmsEventsSection } from '../../components/admin/cms/CmsEventsSection';
import { CmsTipsSection } from '../../components/admin/cms/CmsTipsSection';
import { CmsAboutSection } from '../../components/admin/cms/CmsAboutSection';
import { CmsJoinSection } from '../../components/admin/cms/CmsJoinSection';
import { CmsLocationHint } from '../../components/admin/cms/CmsLocationHint';
import { CmsLegalDocsSection } from '../../components/admin/cms/CmsLegalDocsSection';
import { CmsFooterSection } from '../../components/admin/cms/CmsFooterSection';

type CmsTab = 'hero' | 'lineas' | 'catalogo' | 'videos' | 'eventos' | 'tips' | 'quienes-somos' | 'unete' | 'legal' | 'footer';

const SECTION_META: Record<
  CmsTab,
  { page: string; path: string; section: string; description: string; position: number }
> = {
  hero: {
    page: 'Inicio',
    path: '/',
    section: 'Carrusel superior (primera pantalla)',
    description: 'Es lo primero que ve la clienta al entrar. Ideal para lanzamientos y campañas.',
    position: 1,
  },
  lineas: {
    page: 'Inicio',
    path: '/',
    section: 'Líneas Emblemáticas Yanbal',
    description: 'Bloque de colecciones que aparece después del carrusel y antes del catálogo.',
    position: 2,
  },
  catalogo: {
    page: 'Inicio',
    path: '/',
    section: 'Banner de catálogo digital',
    description: 'Tarjeta de la revista de campaña que invita a recorrer el catálogo.',
    position: 2,
  },
  videos: {
    page: 'Inicio',
    path: '/',
    section: 'Últimos videos / tutoriales',
    description: 'Galería de videos demostrativos que se muestra en la página de inicio.',
    position: 3,
  },
  eventos: {
    page: 'Eventos',
    path: '/eventos',
    section: 'Agenda de talleres y eventos',
    description: 'Listado público de masterclasses presenciales y webinars.',
    position: 2,
  },
  tips: {
    page: 'Tips & Consejos',
    path: '/tips',
    section: 'Listado de artículos',
    description: 'Consejos de cuidado, rutina y negocio que también se enlazan desde el inicio.',
    position: 2,
  },
  'quienes-somos': {
    page: 'Quiénes Somos',
    path: '/quienes-somos',
    section: 'Historia, misión y asesoría',
    description: 'Textos institucionales de la página que presenta al equipo.',
    position: 2,
  },
  unete: {
    page: 'Trabaja con Nosotros',
    path: '/unete',
    section: 'Presentación de roles y formulario',
    description: 'Tarjetas de Consultora/Líder y formulario de postulación.',
    position: 2,
  },
  legal: {
    page: 'Páginas legales',
    path: '/terminos · /privacidad · /cookies · /devoluciones',
    section: 'Términos, privacidad, cookies y devoluciones',
    description: 'Documentos legales que se abren desde el pie de página.',
    position: 3,
  },
  footer: {
    page: 'Pie de página',
    path: 'Todas las páginas',
    section: 'Redes sociales, correo y aviso legal',
    description: 'Iconos de WhatsApp, Instagram, TikTok, correo de contacto y aviso legal.',
    position: 4,
  },
};

export const AdminContentCMSView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    { id: 'hero' as CmsTab, label: 'Hero Carrusel', icon: Layers },
    { id: 'lineas' as CmsTab, label: 'Líneas Yanbal', icon: Sparkles },
    { id: 'catalogo' as CmsTab, label: 'Catálogo Digital', icon: BookOpen },
    { id: 'videos' as CmsTab, label: 'Videos Tutoriales', icon: Video },
    { id: 'eventos' as CmsTab, label: 'Eventos & Talleres', icon: Calendar },
    { id: 'tips' as CmsTab, label: 'Tips & Consejos', icon: Lightbulb },
    { id: 'quienes-somos' as CmsTab, label: 'Quiénes Somos', icon: FileText },
    { id: 'unete' as CmsTab, label: 'Trabaja con Nosotros', icon: Briefcase },
    { id: 'legal' as CmsTab, label: 'Legal', icon: Scale },
    { id: 'footer' as CmsTab, label: 'Pie & Redes', icon: Share2 },
  ];

  const tabParam = searchParams.get('tab') as CmsTab | null;
  const activeTab: CmsTab = tabParam && tabs.some((t) => t.id === tabParam) ? tabParam : 'hero';

  const handleTabChange = (tabId: CmsTab) => {
    setSearchParams({ tab: tabId });
  };

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
              Modifica en tiempo real textos, carruseles, videos, eventos, tips y la sección de liderazgo sin tocar código.
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
                id={'cms-tab-' + tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
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
        <CmsLocationHint {...SECTION_META[activeTab]} previewKey={activeTab} />

        <div className="bg-stone-50/60 p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-xs">
          {activeTab === 'hero' && <CmsHeroSection />}
          {activeTab === 'lineas' && <CmsLinesSection />}
          {activeTab === 'catalogo' && <CmsDigitalCatalogSection />}
          {activeTab === 'videos' && <CmsVideosSection />}
          {activeTab === 'eventos' && <CmsEventsSection />}
          {activeTab === 'tips' && <CmsTipsSection />}
          {activeTab === 'quienes-somos' && <CmsAboutSection />}
          {activeTab === 'unete' && <CmsJoinSection />}
          {activeTab === 'legal' && <CmsLegalDocsSection />}
          {activeTab === 'footer' && <CmsFooterSection />}
        </div>

      </div>
    </div>
  );
};
