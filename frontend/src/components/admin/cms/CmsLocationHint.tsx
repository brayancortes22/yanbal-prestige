import React from 'react';
import { MapPin } from 'lucide-react';
import { CmsSectionPreview } from './CmsSectionPreview';

type PreviewKey =
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

interface Props {
  page: string;
  path: string;
  section: string;
  description: string;
  previewKey: PreviewKey;
}

/**
 * Muestra al editor en qué página está y una simulación de la sección real
 * con los datos actuales del CMS, para que reconozca el bloque que edita.
 */
export const CmsLocationHint: React.FC<Props> = ({
  page,
  path,
  section,
  description,
  previewKey,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
          <MapPin className="h-3 w-3" /> Se verá en {page}
        </span>
        <p className="pt-1 text-sm font-bold text-stone-900">{section}</p>
        <p className="text-[11px] leading-relaxed text-stone-600">{description}</p>
        <code className="inline-block rounded bg-white px-2 py-0.5 font-mono text-[10px] text-sky-700">
          {path}
        </code>
        <p className="pt-1 text-[10px] text-stone-500">
          La simulación de la derecha usa los datos actuales. Si cambias un texto o una imagen,
          se reflejará en la página pública al guardar.
        </p>
      </div>

      <CmsSectionPreview section={previewKey} />
    </div>
  );
};
