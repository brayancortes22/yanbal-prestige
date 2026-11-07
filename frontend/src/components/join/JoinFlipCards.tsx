import React, { useState } from 'react';
import { Sparkles, Crown, ShieldCheck, HeartHandshake, GraduationCap } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { JoinRoleCard } from './JoinRoleCard';

const defaultConsultantBenefits = [
  'Ganancias del 25% al 35% sobre cada referencia vendida.',
  'Kit de inicio bonificado con productos de alta rotación.',
  'Talleres gratuitos de automaquillaje y cuidado de la piel.',
  'Tienda virtual propia y pedidos directos a tu WhatsApp.',
];

const defaultDirectorBenefits = [
  'Bonificaciones por ventas grupales de toda tu red.',
  'Viajes de convención nacionales e internacionales.',
  'Auto 0 km en comodato y reconocimientos de prestigio.',
  'Mentoría ejecutiva personalizada con la Directora Yuli Cortés.',
];

/** Refuerzos de confianza bajo las tarjetas: reducen la fricción del registro. */
const trustSignals = [
  { Icon: ShieldCheck, label: 'Datos protegidos (Ley 1581)' },
  { Icon: GraduationCap, label: 'Formación y acompañamiento' },
  { Icon: HeartHandshake, label: 'Sin experiencia previa' },
];

export const JoinFlipCards: React.FC = () => {
  const { joinContent } = useConfig();
  const [flippedRole, setFlippedRole] = useState<'consultora' | 'directora' | null>(null);

  const consultantBenefits = joinContent?.consultantBenefits?.length
    ? joinContent.consultantBenefits
    : defaultConsultantBenefits;
  const directorBenefits = joinContent?.directorBenefits?.length
    ? joinContent.directorBenefits
    : defaultDirectorBenefits;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <JoinRoleCard
          role="consultora"
          index="01"
          Icon={Sparkles}
          badge={joinContent?.consultantBadge || 'Emprendimiento directo'}
          title={joinContent?.consultantTitle || 'Consultora de Belleza Independiente'}
          description={
            joinContent?.consultantDesc ||
            'Vende los productos emblemáticos de Yanbal con catálogo digital y físico. Administra tu tiempo y gana comisiones inmediatas.'
          }
          benefits={consultantBenefits}
          buttonText={joinContent?.consultantButtonText || 'Quiero ser Consultora de Belleza'}
          theme="consultant"
          isFlipped={flippedRole === 'consultora'}
          onFlip={() => setFlippedRole('consultora')}
          onBack={() => setFlippedRole(null)}
        />

        <JoinRoleCard
          role="directora"
          index="02"
          Icon={Crown}
          badge={joinContent?.directorBadge || 'Carrera de liderazgo'}
          title={joinContent?.directorTitle || 'Directora Independiente & Líder'}
          description={
            joinContent?.directorDesc ||
            'Forma, guía y empodera a tu propio equipo de consultoras. Escala a la cima corporativa con bonos de red e ingresos residuales.'
          }
          benefits={directorBenefits}
          buttonText={joinContent?.directorButtonText || 'Postularme para Líder / Directora'}
          theme="director"
          isFlipped={flippedRole === 'directora'}
          onFlip={() => setFlippedRole('directora')}
          onBack={() => setFlippedRole(null)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-[#EADFD3] bg-white/70 px-5 py-4">
        {trustSignals.map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-stone-600"
          >
            <Icon className="h-4 w-4 text-brand-apricot" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
