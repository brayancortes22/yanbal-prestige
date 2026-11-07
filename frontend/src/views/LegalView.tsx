import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import type { LegalKind } from '../types';

const ORDER: LegalKind[] = ['terminos', 'privacidad', 'cookies', 'devoluciones'];
const LABELS: Record<LegalKind, string> = {
  terminos: 'Términos y Condiciones',
  privacidad: 'Política de Privacidad',
  cookies: 'Política de Cookies',
  devoluciones: 'Devoluciones y Reembolsos',
};

export const LegalView: React.FC<{ kind: LegalKind }> = ({ kind }) => {
  const { legalDocs } = useConfig();
  const content = legalDocs[kind];

  return (
    <div className="min-h-[70vh] bg-brand-cream py-12 animate-fadeIn">
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
            {content.tag}
          </span>
          <h1 className="font-editorial text-3xl font-bold text-stone-900">{content.title}</h1>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">{content.intro}</p>
          <p className="mt-2 text-[10px] text-stone-400">
            Última actualización: noviembre de 2026. Este documento es informativo y no sustituye
            la asesoría jurídica de un abogado.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ORDER.map((item) => (
            <Link
              key={item}
              to={`/${item}`}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                item === kind
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300'
              }`}
            >
              {LABELS[item]}
            </Link>
          ))}
        </div>

        <article className="space-y-5 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-8">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-editorial text-lg font-bold text-stone-900">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-xs leading-relaxed text-stone-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Tus datos y tus compras están protegidos. Si algo no coincide con lo prometido,
              escríbenos y lo resolvemos por el canal oficial.
            </span>
          </div>
        </article>
      </div>
    </div>
  );
};
