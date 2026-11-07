import React, { useId, useState } from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';

const POSTAL_CODES = [
  ['110111', 'Bogotá · Centro'],
  ['110221', 'Bogotá · Chapinero'],
  ['111511', 'Bogotá · Suba'],
  ['050001', 'Medellín · Centro'],
  ['055422', 'Envigado'],
  ['760001', 'Cali · Centro'],
  ['080001', 'Barranquilla'],
  ['130001', 'Cartagena'],
  ['680001', 'Bucaramanga'],
  ['660001', 'Pereira'],
  ['170001', 'Manizales'],
  ['410001', 'Neiva'],
  ['500001', 'Villavicencio'],
  ['730001', 'Ibagué'],
  ['540001', 'Cúcuta'],
  ['520001', 'Pasto'],
  ['470001', 'Santa Marta'],
  ['630001', 'Armenia'],
  ['700001', 'Sincelejo'],
  ['230001', 'Montería'],
  ['150001', 'Tunja'],
] as const;

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Código postal con ayuda: muchas personas no lo conocen. Ofrece los
 * códigos de las ciudades principales, un enlace a la consulta oficial de
 * 4-72 y deja claro que el campo es opcional.
 */
export const PostalCodeField: React.FC<Props> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Código postal',
}) => {
  const listId = useId();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          list={listId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full p-2 rounded-xl border border-stone-200 bg-stone-50/50 font-mono focus:border-brand-apricot focus:outline-none ${className}`}
        />
        <datalist id={listId}>
          {POSTAL_CODES.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </datalist>
      </div>

      <button
        type="button"
        onClick={() => setShowHelp((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-sky-700 hover:underline"
      >
        <HelpCircle className="h-3 w-3" />
        ¿No sabes tu código postal?
      </button>

      {showHelp && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[10px] leading-relaxed text-sky-800">
          <p>
            Escribe las primeras letras de tu ciudad en el campo o elige una sugerencia. Si tu
            municipio no aparece, puedes consultarlo en la herramienta oficial de 4-72.
          </p>
          <a
            href="https://www.4-72.com.co/"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-bold text-sky-700 underline"
          >
            Consultar en 4-72 <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-1 text-sky-600">
            El código postal es opcional: si no lo tienes, déjalo vacío y la dirección completa
            sigue siendo válida.
          </p>
        </div>
      )}
    </div>
  );
};
