import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  hint?: string;
  keywords?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  /** Permite limpiar la selección (útil para filtros). */
  clearable?: boolean;
}

/**
 * Selector con búsqueda para listas largas (clientas, productos, líderes).
 * Reemplaza el `<select>` nativo, que se vuelve inmanejable cuando la
 * consultora tiene decenas o cientos de clientas registradas.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  disabled = false,
  clearable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      `${option.label} ${option.hint || ''} ${option.keywords || ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectOption = (option: SearchableOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          disabled={disabled}
          onClick={openDropdown}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2.5 text-left text-xs text-stone-800 transition-colors hover:border-brand-apricot/50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <span className={selected ? 'truncate' : 'truncate text-stone-400'}>
            {selected ? selected.label : placeholder}
            {selected?.hint && (
              <span className="ml-1.5 text-[10px] text-stone-400">· {selected.hint}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && selected && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Limpiar selección"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onChange('');
                  }
                }}
                className="rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-xl border border-brand-apricot/60 bg-white py-2.5 pl-9 pr-3 text-xs text-stone-800 shadow-sm outline-none focus:border-brand-apricot"
            aria-autocomplete="list"
            aria-expanded
          />
        </div>
      )}

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-xl"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-[11px] text-stone-400">{emptyMessage}</li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[11px] ${
                    index === activeIndex ? 'bg-brand-apricot-soft' : 'bg-white'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-stone-800">{option.label}</span>
                    {option.hint && (
                      <span className="block truncate text-[10px] text-stone-400">{option.hint}</span>
                    )}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand-apricot" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
