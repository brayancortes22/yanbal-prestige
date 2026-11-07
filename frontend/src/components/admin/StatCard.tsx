import React from 'react';
import type { LucideIcon } from 'lucide-react';

type StatTone = 'apricot' | 'gold' | 'espresso' | 'sand';

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: StatTone;
}

/**
 * Tarjeta de KPI del panel. Usa una sola familia cálida (terracota,
 * champagne, espresso y arena) en lugar de los iconos verde/azul/ámbar
 * que rompían la identidad de marca.
 */
const toneStyles: Record<StatTone, string> = {
  apricot: 'bg-brand-apricot-soft text-brand-apricot',
  gold: 'bg-[#FBF3D9] text-[#9A7A16]',
  espresso: 'bg-[#F0E7DF] text-brand-espresso',
  sand: 'bg-brand-sand/70 text-[#8A7259]',
};

export const StatCard: React.FC<StatCardProps> = ({ Icon, label, value, hint, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div className="min-w-0">
      <span className="block text-[11px] font-medium text-stone-500">{label}</span>
      <h4 className="truncate font-editorial text-xl font-bold text-stone-900">{value}</h4>
      <span className="block truncate text-[10px] text-stone-400">{hint}</span>
    </div>
  </div>
);
