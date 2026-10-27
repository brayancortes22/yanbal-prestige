import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Play, Star } from 'lucide-react';
import type { TipCategory, TipItem } from '../../types';
import { formatTipDate, readingMinutes } from './tipUtils';

const CATEGORY_STYLES: Record<TipCategory, string> = {
  Rutina: 'bg-orange-50 text-orange-700 border-orange-100',
  Cuidado: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Maquillaje: 'bg-rose-50 text-rose-700 border-rose-100',
  Negocio: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

interface Props {
  tip: TipItem;
  variant?: 'default' | 'featured';
}

export const TipCard: React.FC<Props> = ({ tip, variant = 'default' }) => {
  const isFeatured = variant === 'featured';

  return (
    <Link
      to={`/tips/${tip.id}`}
      className={`card-luxury rounded-3xl overflow-hidden group flex ${
        isFeatured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-stone-100 ${
          isFeatured ? 'md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[280px]' : 'aspect-[16/10]'
        }`}
      >
        <img
          src={tip.image}
          alt={tip.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {tip.videoUrl && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900/85 text-white text-[10px] font-semibold">
            <Play className="w-3 h-3" /> Video
          </span>
        )}

        {tip.featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-orange-700 text-[10px] font-bold uppercase tracking-wide shadow-sm">
            <Star className="w-3 h-3" /> Destacado
          </span>
        )}
      </div>

      <div className={`p-6 flex flex-col justify-between gap-4 ${isFeatured ? 'md:w-1/2' : ''}`}>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${CATEGORY_STYLES[tip.category]}`}
            >
              {tip.category}
            </span>
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {readingMinutes(tip.content)} min de lectura
            </span>
          </div>

          <h3
            className={`font-editorial font-bold text-stone-900 leading-snug ${
              isFeatured ? 'text-2xl sm:text-3xl' : 'text-lg'
            }`}
          >
            {tip.title}
          </h3>

          <p className={`text-stone-500 leading-relaxed ${isFeatured ? 'text-sm' : 'text-xs line-clamp-3'}`}>
            {tip.summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-[11px] text-stone-400">
            {tip.author} · {formatTipDate(tip.createdAt)}
          </span>
          <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
            Leer <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
