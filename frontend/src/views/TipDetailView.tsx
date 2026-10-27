import React, { useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronRight, Clock, MessageCircle, User } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { TipContent } from '../components/tips/TipContent';
import { TipCard } from '../components/tips/TipCard';
import { formatTipDate, readingMinutes } from '../components/tips/tipUtils';
import { MediaGallery } from '../components/media/MediaGallery';
import type { MediaItem } from '../types';

export const TipDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tips } = useConfig();

  const tip = tips.find((item) => item.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const gallery = useMemo<MediaItem[]>(() => {
    if (!tip) return [];
    const items: MediaItem[] = [{ id: `${tip.id}-cover`, url: tip.image, type: 'image', alt: tip.title }];
    if (tip.videoUrl) {
      items.push({ id: `${tip.id}-video`, url: tip.videoUrl, type: 'video', alt: tip.title });
    }
    return items;
  }, [tip]);

  const related = useMemo(
    () =>
      tips
        .filter((item) => item.active && item.id !== tip?.id)
        .sort((a, b) => a.order - b.order)
        .slice(0, 3),
    [tips, tip?.id]
  );

  if (!tip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-brand-cream text-center space-y-4">
        <h2 className="font-editorial text-2xl font-bold text-stone-900">Consejo no encontrado</h2>
        <p className="text-xs text-stone-500 max-w-sm">
          Este tip no existe o fue retirado de la colección.
        </p>
        <button
          type="button"
          onClick={() => navigate('/tips')}
          className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold cursor-pointer"
        >
          Ver todos los tips
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-white min-h-[85vh] animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-stone-900 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link to="/tips" className="hover:text-stone-900 transition-colors">Tips & Consejos</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-orange-600 font-semibold">{tip.category}</span>
          </div>

          <Link
            to="/tips"
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a los tips</span>
          </Link>
        </div>

        <header className="space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold uppercase tracking-widest">
            {tip.category}
          </span>

          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-bold leading-tight">
            {tip.title}
          </h1>

          <p className="text-sm sm:text-base text-stone-500 leading-relaxed">{tip.summary}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-stone-400 pt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {tip.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatTipDate(tip.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {readingMinutes(tip.content)} min de lectura
            </span>
          </div>
        </header>

        <MediaGallery
          media={gallery}
          fallback={tip.image}
          alt={tip.title}
          aspect="aspect-[16/10]"
        />

        <article className="max-w-none">
          <TipContent content={tip.content} />
        </article>

        <div className="rounded-3xl bg-stone-50 border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
              Asesoría personalizada
            </span>
            <p className="text-sm text-stone-700 font-semibold">
              ¿Quieres aplicar este consejo con acompañamiento?
            </p>
          </div>
          <a
            href={`https://wa.me/573000000000?text=${encodeURIComponent(
              `Hola! Leí el tip "${tip.title}" y quiero una asesoría personalizada.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Escribir por WhatsApp</span>
          </a>
        </div>

        {related.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="font-editorial text-xl font-bold text-stone-900">
              Sigue leyendo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <TipCard key={item.id} tip={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
