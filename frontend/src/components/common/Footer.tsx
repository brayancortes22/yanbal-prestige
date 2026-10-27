import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-white block">
              YANBAL <span className="text-orange-500 italic font-normal">Prestige</span>
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Comunidad independiente de Consultoras y Directoras autorizadas. Asesoría dermocosmética experta, cosmética botánica y plan de carrera para emprendedoras.
            </p>
            <div className="text-[11px] text-stone-500">
              © 2026 Yanbal Prestige Team. Todos los derechos reservados.
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block mb-3">Navegación</span>
            <Link to="/catalogo" className="block hover:text-white transition-colors">Catálogo de Productos</Link>
            <Link to="/quienes-somos" className="block hover:text-white transition-colors">Quiénes Somos & Equipo</Link>
            <Link to="/eventos" className="block hover:text-white transition-colors">Talleres & Agenda</Link>
            <Link to="/tips" className="block hover:text-white transition-colors">Tips & Consejos</Link>
            <Link to="/unete" className="block hover:text-white transition-colors">Oportunidad Yanbal</Link>
            <Link to="/admin" className="block text-stone-500 hover:text-orange-400 transition-colors pt-1">Acceso Administrativo CMS</Link>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider block mb-3">Redes & Contacto Directo</span>
            <div className="flex flex-wrap items-center gap-3">
              <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer" title="WhatsApp" className="w-10 h-10 rounded-full bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" className="w-10 h-10 rounded-full bg-stone-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-600 hover:to-purple-600 text-stone-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok" className="w-10 h-10 rounded-full bg-stone-800 hover:bg-black text-stone-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-stone-700/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded bg-stone-800 text-[10px] text-stone-300 font-medium">Garantía SIC & Habeas Data Colombia</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-800/80 text-[11px] text-stone-500 leading-relaxed">
          <strong>Aviso Legal y Descargo de Responsabilidad:</strong> Este sitio web es propiedad y está administrado por Consultoras y Directoras Independientes de Belleza Yanbal. No es el sitio web corporativo oficial de Yanbal International ni de Yanbal de Colombia S.A.S. Las marcas registradas, logotipos y productos son propiedad de Yanbal International.
        </div>
      </div>
    </footer>
  );
};
