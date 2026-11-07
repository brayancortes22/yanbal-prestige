import React, { useState } from 'react';
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import { useConfirm } from '../../ui/ConfirmProvider';
import type { LegalDocument, LegalKind, LegalSection } from '../../../types';

const DOCS: { id: LegalKind; label: string; path: string }[] = [
  { id: 'terminos', label: 'Términos y Condiciones', path: '/terminos' },
  { id: 'privacidad', label: 'Privacidad / Habeas Data', path: '/privacidad' },
  { id: 'cookies', label: 'Política de Cookies', path: '/cookies' },
  { id: 'devoluciones', label: 'Devoluciones y Reembolsos', path: '/devoluciones' },
];

const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs focus:border-orange-400 focus:outline-none';

const LegalDocEditor: React.FC<{
  kind: LegalKind;
  initial: LegalDocument;
  onSave: (kind: LegalKind, doc: LegalDocument) => void;
}> = ({ kind, initial, onSave }) => {
  const confirm = useConfirm();
  const [tag, setTag] = useState(initial.tag);
  const [title, setTitle] = useState(initial.title);
  const [intro, setIntro] = useState(initial.intro);
  const [sections, setSections] = useState<LegalSection[]>(initial.sections);
  const [saved, setSaved] = useState(false);

  const updateSection = (index: number, patch: Partial<LegalSection>) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, ...patch } : section))
    );
  };

  const removeSection = async (index: number) => {
    const accepted = await confirm({
      title: '¿Eliminar esta cláusula?',
      message: `Se quitará "${sections[index]?.heading || 'la cláusula'}" del documento.`,
      confirmText: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!accepted) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onSave(kind, {
      tag: tag.trim(),
      title: title.trim(),
      intro: intro.trim(),
      sections: sections
        .map((section) => ({
          heading: section.heading.trim(),
          body: section.body.map((paragraph) => paragraph.trim()).filter(Boolean),
        }))
        .filter((section) => section.heading && section.body.length > 0),
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
          <CheckCircle className="h-3.5 w-3.5" /> Documento actualizado en el sitio público.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-[10px] font-bold uppercase text-stone-500">
          Etiqueta superior
          <input value={tag} onChange={(e) => setTag(e.target.value)} className={`mt-0.5 ${inputClass}`} />
        </label>
        <label className="text-[10px] font-bold uppercase text-stone-500">
          Título del documento
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-0.5 ${inputClass}`} />
        </label>
      </div>

      <label className="block text-[10px] font-bold uppercase text-stone-500">
        Introducción
        <textarea
          rows={2}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className={`mt-0.5 ${inputClass}`}
        />
      </label>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={section.heading}
                onChange={(e) => updateSection(index, { heading: e.target.value })}
                placeholder={`Título de la cláusula ${index + 1}`}
                className={`${inputClass} font-semibold`}
              />
              <button
                type="button"
                onClick={() => void removeSection(index)}
                className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                title="Eliminar cláusula"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              rows={4}
              value={section.body.join('\n\n')}
              onChange={(e) =>
                updateSection(index, {
                  body: e.target.value.split(/\n\s*\n/),
                })
              }
              placeholder="Un párrafo por bloque, separados por una línea en blanco."
              className={`${inputClass} leading-relaxed`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setSections((prev) => [...prev, { heading: '', body: [''] }])}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-600 hover:bg-stone-50"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar cláusula
        </button>
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-stone-800"
        >
          <Save className="h-3.5 w-3.5" /> Guardar documento
        </button>
      </div>
    </form>
  );
};

export const CmsLegalDocsSection: React.FC = () => {
  const { legalDocs, saveLegalDoc } = useConfig();
  const [kind, setKind] = useState<LegalKind>('terminos');
  const meta = DOCS.find((doc) => doc.id === kind)!;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">
          Términos, privacidad, cookies y devoluciones
        </h3>
        <p className="text-xs text-stone-500">
          Edita el texto legal que ven las clientas en las páginas públicas. Los cambios se
          publican al guardar, sin tocar código.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DOCS.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => setKind(doc.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              kind === doc.id
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300'
            }`}
          >
            {doc.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[11px] text-sky-800">
        <span>
          Editando <strong>{meta.label}</strong> · se verá en <code>{meta.path}</code>
        </span>
      </div>

      <LegalDocEditor
        key={kind}
        kind={kind}
        initial={legalDocs[kind]}
        onSave={saveLegalDoc}
      />
    </div>
  );
};
