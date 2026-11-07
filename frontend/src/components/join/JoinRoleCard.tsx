import React from 'react';
import { CheckCircle2, ArrowRight, type LucideIcon } from 'lucide-react';
import { JoinForm } from './JoinForm';

type RoleTheme = 'consultant' | 'director';

interface JoinRoleCardProps {
  role: 'consultora' | 'directora';
  index: string;
  Icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  theme: RoleTheme;
  isFlipped: boolean;
  onFlip: () => void;
  onBack: () => void;
}

const themeStyles: Record<RoleTheme, {
  shell: string;
  badge: string;
  title: string;
  body: string;
  benefit: string;
  divider: string;
  button: string;
  ornament: string;
}> = {
  consultant: {
    shell: 'border-[#F0D3C7] bg-[linear-gradient(145deg,#FFFFFF_0%,#FFF8F4_55%,#FBE9E1_100%)]',
    badge: 'border-brand-apricot/25 bg-white/80 text-brand-apricot-dark',
    title: 'text-stone-900',
    body: 'text-stone-600',
    benefit: 'text-stone-700',
    divider: 'border-[#F3DED5]',
    button:
      'bg-brand-apricot text-white shadow-[0_10px_24px_-10px_rgba(232,93,54,0.65)] hover:bg-brand-apricot-dark',
    ornament: 'bg-brand-apricot/10',
  },
  director: {
    shell:
      'border-[#6D432C] bg-[linear-gradient(150deg,#2E1B15_0%,#43261B_48%,#6A3A23_100%)]',
    badge: 'border-brand-gold/35 bg-[#2A1913]/80 text-brand-gold-soft',
    title: 'text-[#FFF7EC]',
    body: 'text-[#E7D6C6]',
    benefit: 'text-[#EADCCF]',
    divider: 'border-white/10',
    button:
      'bg-brand-gold text-[#2E1B15] shadow-[0_10px_24px_-10px_rgba(201,162,39,0.7)] hover:bg-brand-gold-soft',
    ornament: 'bg-brand-gold/15',
  },
};

/**
 * Tarjeta 3D reutilizable para las dos rutas de emprendimiento.
 * Unifica la paleta (terracota/champagne y espresso/oro) y elimina el
 * contraste duro blanco vs. negro que hacía ver el bloque como dos
 * componentes de sitios distintos.
 */
export const JoinRoleCard: React.FC<JoinRoleCardProps> = ({
  role,
  index,
  Icon,
  badge,
  title,
  description,
  benefits,
  buttonText,
  theme,
  isFlipped,
  onFlip,
  onBack,
}) => {
  const styles = themeStyles[theme];

  return (
    <div className="relative min-h-[560px] [perspective:1200px]">
      <div
        className={`h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Cara frontal */}
        <div
          className={`absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] border p-7 shadow-[0_24px_60px_-32px_rgba(60,30,20,0.35)] [backface-visibility:hidden] sm:p-9 ${styles.shell}`}
        >
          <div
            className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${styles.ornament}`}
          />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-white/40 blur-3xl" />

          <div className="relative space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles.badge}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {badge}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  theme === 'director' ? 'text-[#C9AE8F]' : 'text-stone-400'
                }`}
              >
                Ruta {index}
              </span>
            </div>

            <div className="space-y-2.5">
              <h3
                className={`font-editorial text-2xl font-bold leading-tight sm:text-[2rem] ${styles.title}`}
              >
                {title}
              </h3>
              <p className={`text-[13px] leading-relaxed ${styles.body}`}>{description}</p>
            </div>

            <ul className="space-y-3 pt-1">
              {benefits.map((benefit) => (
                <li key={benefit} className={`flex items-start gap-2.5 text-[12.5px] ${styles.benefit}`}>
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      theme === 'director' ? 'text-brand-gold' : 'text-brand-apricot'
                    }`}
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`relative mt-6 border-t pt-6 ${styles.divider}`}>
            <button
              type="button"
              onClick={onFlip}
              className={`group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold transition-all ${styles.button}`}
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Cara posterior: formulario */}
        <div className="absolute inset-0 h-full w-full overflow-y-auto rounded-[2rem] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <JoinForm initialRole={role} onBack={onBack} compact />
        </div>
      </div>
    </div>
  );
};
