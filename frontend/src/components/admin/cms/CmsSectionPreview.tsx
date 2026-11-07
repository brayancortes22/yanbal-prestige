import React from 'react';
import { PencilRuler } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

type PreviewSection =
  | 'hero'
  | 'lineas'
  | 'catalogo'
  | 'videos'
  | 'eventos'
  | 'tips'
  | 'quienes-somos'
  | 'unete'
  | 'legal'
  | 'footer';

const frame =
  'overflow-hidden rounded-xl border border-stone-200 bg-white shadow-inner';

const ImageFallback: React.FC<{ src?: string; className?: string }> = ({ src, className }) => (
  <div className={`bg-stone-200 ${className || ''}`}>
    {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
  </div>
);

/**
 * Simulación en miniatura de la sección real que se está editando. Usa los
 * datos actuales del CMS para que la administradora reconozca el bloque.
 */
export const CmsSectionPreview: React.FC<{ section: PreviewSection }> = ({ section }) => {
  const {
    heroSlides,
    linesAccordion,
    digitalCatalog,
    videoTips,
    events,
    tips,
    aboutContent,
    joinContent,
    legalDocs,
  } = useConfig();

  const hero = heroSlides[0];
  const line = linesAccordion[0];

  return (
    <div className="space-y-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
        <PencilRuler className="h-3 w-3" /> Estás editando esta sección
      </span>

      <div className={`${frame} border-2 border-orange-400`}>
        {section === 'hero' && (
          <div className="relative h-40 bg-stone-900 text-white">
            <ImageFallback src={hero?.image} className="absolute inset-0 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/70 to-transparent" />
            <div className="relative z-10 flex h-full max-w-[75%] flex-col justify-center gap-1 p-4">
              <span className="text-[8px] font-bold uppercase tracking-widest text-orange-300">
                {hero?.badge || 'Lanzamiento exclusivo'}
              </span>
              <span className="text-[9px] text-stone-300">{hero?.title || 'Nuevo Genactive'}</span>
              <strong className="text-[14px] leading-tight">
                {hero?.subtitle || 'Sérum Filler Antiarrrugas'}
              </strong>
              <p className="line-clamp-2 text-[8px] text-stone-300">
                {hero?.desc || 'Descripción del beneficio principal.'}
              </p>
              <span className="mt-1 w-fit rounded-full bg-orange-600 px-2 py-1 text-[8px] font-bold">
                Conoce más en el catálogo
              </span>
            </div>
          </div>
        )}

        {section === 'lineas' && (
          <div className="space-y-2 bg-brand-cream p-3">
            <div className="text-center">
              <span className="text-[7px] font-bold uppercase tracking-widest text-orange-600">
                Líneas emblemáticas Yanbal
              </span>
              <p className="text-[11px] font-bold text-stone-900">Innovación Botánica & Alta Gama</p>
            </div>
            <div className="flex h-24 gap-1.5">
              <div className="relative flex-[3] overflow-hidden rounded-lg">
                <ImageFallback src={line?.image} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2 text-white">
                  <span className="block text-[6px] uppercase text-orange-300">{line?.tagline}</span>
                  <strong className="block text-[10px] leading-tight">{line?.title}</strong>
                  <div className="mt-1 flex gap-1">
                    {(line?.claims || []).slice(0, 2).map((claim) => (
                      <span key={claim} className="rounded-full bg-white/20 px-1 text-[6px]">
                        {claim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {linesAccordion.slice(1, 3).map((item) => (
                <div key={item.id} className="relative flex-1 overflow-hidden rounded-lg">
                  <ImageFallback src={item.image} className="absolute inset-0 opacity-50" />
                  <div className="absolute inset-0 bg-stone-950/50" />
                  <span className="absolute bottom-1 left-1 right-1 text-[6px] font-bold text-white">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'catalogo' && (
          <div className="grid grid-cols-[90px_1fr] gap-3 bg-stone-900 p-3 text-white">
            <ImageFallback src={digitalCatalog.coverImage} className="h-24 rounded-lg" />
            <div className="flex flex-col justify-center gap-1">
              <span className="w-fit rounded-full bg-orange-600 px-1.5 py-0.5 text-[6px] font-bold">
                {digitalCatalog.badge || 'Campaña actual'}
              </span>
              <strong className="text-[11px] leading-tight">
                Mira nuestro catálogo{' '}
                <span className="italic text-orange-400">{digitalCatalog.titleHighlight}</span>
              </strong>
              <p className="line-clamp-2 text-[7px] text-stone-300">{digitalCatalog.description}</p>
              <span className="text-[7px] font-bold text-orange-300">
                {digitalCatalog.discountText} · {digitalCatalog.specialEditionText}
              </span>
            </div>
          </div>
        )}

        {section === 'videos' && (
          <div className="space-y-2 p-3">
            <p className="text-center text-[10px] font-bold text-orange-600">Últimos videos</p>
            <div className="grid grid-cols-3 gap-1.5">
              {videoTips.slice(0, 3).map((item) => (
                <div key={item.id} className="overflow-hidden rounded-lg border border-stone-200">
                  <div className="relative h-14">
                    <ImageFallback src={item.image} className="absolute inset-0" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[7px] text-orange-600">
                        ▶
                      </span>
                    </span>
                    <span className="absolute bottom-1 right-1 rounded bg-stone-900/80 px-1 text-[6px] text-white">
                      {item.duration}
                    </span>
                  </div>
                  <p className="line-clamp-1 p-1 text-[7px] font-bold text-stone-800">{item.title}</p>
                </div>
              ))}
              {videoTips.length === 0 && (
                <p className="col-span-3 text-[8px] text-stone-400">Sin videos cargados.</p>
              )}
            </div>
          </div>
        )}

        {section === 'eventos' && (
          <div className="space-y-2 p-3">
            <p className="text-[9px] font-bold text-stone-900">Agenda de talleres</p>
            <div className="grid grid-cols-2 gap-1.5">
              {events.slice(0, 2).map((item) => (
                <div key={item.id} className="flex gap-1.5 rounded-lg border border-stone-200 p-1.5">
                  <ImageFallback src={item.image} className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[7px] font-bold text-stone-900">{item.title}</p>
                    <p className="text-[6px] text-orange-600">{item.date}</p>
                    <p className="text-[6px] text-stone-500">{item.time}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="col-span-2 text-[8px] text-stone-400">Sin eventos cargados.</p>
              )}
            </div>
          </div>
        )}

        {section === 'tips' && (
          <div className="space-y-2 p-3">
            <p className="text-[10px] font-bold text-stone-900">Tips & consejos</p>
            <div className="grid grid-cols-2 gap-1.5">
              {tips.slice(0, 2).map((item) => (
                <div key={item.id} className="overflow-hidden rounded-lg border border-stone-200">
                  <ImageFallback src={item.image} className="h-14" />
                  <div className="p-1.5">
                    <span className="rounded-full bg-orange-50 px-1 text-[6px] font-bold text-orange-700">
                      {item.category}
                    </span>
                    <p className="line-clamp-1 text-[7px] font-bold text-stone-900">{item.title}</p>
                    <p className="line-clamp-1 text-[6px] text-stone-500">{item.summary}</p>
                  </div>
                </div>
              ))}
              {tips.length === 0 && (
                <p className="col-span-2 text-[8px] text-stone-400">Sin consejos cargados.</p>
              )}
            </div>
          </div>
        )}

        {section === 'quienes-somos' && (
          <div className="space-y-2 bg-brand-cream p-3 text-center">
            <span className="text-[7px] font-bold uppercase tracking-widest text-orange-600">
              {aboutContent.historyTag}
            </span>
            <p className="text-[11px] font-bold text-stone-900">{aboutContent.historyTitle}</p>
            <p className="line-clamp-2 text-[7px] text-stone-600">{aboutContent.historyDesc}</p>
            <div className="mx-auto max-w-[90%] rounded-lg border border-stone-200 bg-white p-2 text-left">
              <span className="text-[6px] font-bold uppercase text-orange-600">
                {aboutContent.missionTag}
              </span>
              <p className="text-[8px] font-bold text-stone-900">{aboutContent.missionTitle}</p>
              <p className="line-clamp-1 text-[6px] text-stone-500">{aboutContent.missionDesc}</p>
            </div>
          </div>
        )}

        {section === 'unete' && (
          <div className="space-y-2 p-3">
            <p className="text-[9px] font-bold text-stone-900">{joinContent.title}</p>
            <p className="line-clamp-1 text-[7px] text-stone-500">{joinContent.subtitle}</p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-1.5">
                <p className="text-[7px] font-bold text-orange-800">{joinContent.consultantTitle}</p>
                <p className="line-clamp-2 text-[6px] text-stone-600">
                  {joinContent.consultantDesc}
                </p>
              </div>
              <div className="rounded-lg bg-stone-900 p-1.5 text-white">
                <p className="text-[7px] font-bold text-amber-400">{joinContent.directorTitle}</p>
                <p className="line-clamp-2 text-[6px] text-stone-300">{joinContent.directorDesc}</p>
              </div>
            </div>
          </div>
        )}

        {section === 'legal' && (
          <div className="space-y-2 p-3">
            <p className="text-[9px] font-bold text-stone-900">Páginas legales</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ['terminos', 'Términos'],
                  ['privacidad', 'Privacidad'],
                  ['cookies', 'Cookies'],
                  ['devoluciones', 'Devoluciones'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="rounded-lg border border-stone-200 bg-stone-50 p-1.5">
                  <p className="text-[7px] font-bold text-stone-800">{label}</p>
                  <p className="line-clamp-1 text-[6px] text-stone-500">
                    {legalDocs[key].title}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-stone-900 p-1.5 text-[6px] text-stone-300">
              Pie de página: WhatsApp · Instagram · TikTok · correo de contacto
            </div>
          </div>
        )}

        {section === 'footer' && (
          <div className="space-y-2 bg-stone-900 p-3 text-white">
            <div className="flex items-center justify-between border-b border-stone-700 pb-1.5">
              <span className="text-[9px] font-bold">
                YANBAL <span className="italic text-orange-400">Prestige</span>
              </span>
              <span className="text-[6px] text-stone-400">© 2026</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-0.5 text-[6px] text-stone-300">
                <p className="font-bold text-[7px] text-white">Legal</p>
                <p>Términos y Condiciones</p>
                <p>Política de Privacidad</p>
                <p>Política de Cookies</p>
                <p>Devoluciones y Reembolsos</p>
                <p className="text-sky-300">contacto@yanbalprestige.com</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  {['WhatsApp', 'Instagram', 'TikTok'].map((label) => (
                    <span
                      key={label}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[5px] font-bold text-stone-300"
                      title={label}
                    >
                      {label[0]}
                    </span>
                  ))}
                </div>
                <p className="max-w-[140px] text-right text-[5px] leading-tight text-stone-500">
                  Aviso legal y descargo de responsabilidad configurable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-[9px] text-stone-400">
        Vista aproximada con los datos actuales. El resultado final se ve en la página pública.
      </p>
    </div>
  );
};
