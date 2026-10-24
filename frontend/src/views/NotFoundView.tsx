import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, ShoppingBag, MessageCircle, ArrowLeft } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Auditoría de rutas erróneas / escaneo de URLs (Inspirado en autogestion-sena)
    console.warn(`[Auditoría 404] Ruta no encontrada o no autorizada: ${location.pathname} [${new Date().toISOString()}]`);
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-stone-950">
      {/* Luz ambiental sutil de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 p-8 sm:p-12 rounded-3xl bg-stone-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80">
        {/* Badge superior con icono */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-6">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Error 404 • Ruta no encontrada</span>
        </div>

        {/* Número 404 de alto impacto visual */}
        <h1 className="text-7xl sm:text-8xl font-black font-serif tracking-tighter bg-gradient-to-b from-white via-stone-200 to-amber-500/30 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Título editorial */}
        <h2 className="text-2xl sm:text-3xl font-serif text-white mb-4">
          La exclusividad que buscas cambió de lugar
        </h2>

        {/* Explicación concisa */}
        <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-8">
          La fragancia, producto o enlace que intentas abrir no existe o ha sido reubicado en nuestro catálogo oficial Yanbal Prestige.
        </p>

        {/* Botones de acción con iconos oficiales de Lucide */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Regresar al Inicio</span>
          </Link>

          <Link
            to="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-sm tracking-wide transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Ver Catálogo</span>
          </Link>
        </div>

        {/* Enlace directo a asesoría personalizada */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-stone-400">
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>¿Buscas un producto específico?</span>
          <a
            href="https://wa.me/573100000000?text=Hola%20Directora%20Yuli,%20estoy%20buscando%20un%20producto%20en%20Yanbal%20Prestige"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Consultar por WhatsApp</span>
            <ArrowLeft className="w-3 h-3 rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
};
