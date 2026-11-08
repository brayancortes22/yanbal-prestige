import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, UserCheck } from 'lucide-react';
import type { AppUser } from '../../types';

interface SearchableConsultantSelectProps {
  currentId?: string;
  currentName?: string;
  consultants: AppUser[];
  onSelect: (consultantId: string) => void;
  className?: string;
}

export const SearchableConsultantSelect: React.FC<SearchableConsultantSelectProps> = ({
  currentId,
  currentName,
  consultants,
  onSelect,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return consultants;
    return consultants.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.zone && c.zone.toLowerCase().includes(term)) ||
        (c.role && c.role.toLowerCase().includes(term))
    );
  }, [consultants, searchTerm]);

  const selectedConsultant = consultants.find((c) => c.id === currentId);
  const displayName = selectedConsultant
    ? selectedConsultant.name.replace(/\s*\([^)]*\)\s*$/, '')
    : currentName || 'Sin asignar';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium max-w-[200px] truncate shadow-2xs transition-colors cursor-pointer"
        title="Clic para cambiar consultora con buscador inteligente"
      >
        <UserCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        <span className="truncate">{displayName}</span>
        <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-white border border-stone-200/90 shadow-xl z-50 p-2 animate-fadeIn">
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar consultora o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-stone-100 no-scrollbar">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-[11px] text-stone-400">
                No se encontraron consultoras.
              </p>
            ) : (
              filtered.map((c) => {
                const isSelected = c.id === currentId;
                const cleanName = c.name.replace(/\s*\([^)]*\)\s*$/, '');
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 text-orange-900 font-semibold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate">{cleanName}</span>
                      <span className="block text-[10px] text-stone-400 font-normal">
                        {c.zone || 'Sin zona'} · {c.role === 'LIDER_ZONA' ? 'Líder' : 'Consultora'}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
