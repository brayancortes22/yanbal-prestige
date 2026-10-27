import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const HeroSlider: React.FC = () => {
  const navigate = useNavigate();
  const { heroSlides } = useConfig();
  const activeSlides = heroSlides.filter((s) => s.active);
  const slides = activeSlides.length > 0 ? activeSlides : heroSlides;

  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || slides[0];
  if (!slide) return null;

  return (
    <section className="relative overflow-hidden bg-stone-900 text-white">
      <div className="relative min-h-[460px] sm:min-h-[520px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-40 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold uppercase tracking-wider">
              {slide.badge}
            </span>
            <div className="space-y-1">
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase block">
                {slide.title}
              </span>
              <h1 className="font-editorial text-3xl sm:text-5xl font-normal leading-tight text-white">
                {slide.subtitle}
              </h1>
            </div>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {slide.desc}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/catalogo')}
                className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Conoce Más en el Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/unete')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
              >
                Trabaja con nosotros
              </button>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    i === current ? 'bg-orange-600 w-6' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
