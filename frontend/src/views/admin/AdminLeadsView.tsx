import React from 'react';
import { MessageCircle, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';

export const AdminLeadsView: React.FC = () => {
  const mockLeads = [
    {
      id: 'lead-1',
      fullName: 'Paola Andrea Vargas',
      phone: '+57 311 987 6543',
      city: 'Bogotá (Usaquén)',
      roleInterest: 'Consultora de Belleza',
      date: '2026-04-20',
      status: 'Pendiente de Contacto',
    },
    {
      id: 'lead-2',
      fullName: 'Claudia Patricia Gil',
      phone: '+57 316 444 5566',
      city: 'Medellín (Envigado)',
      roleInterest: 'Plan de Carrera (Directora)',
      date: '2026-04-19',
      status: 'Entrevista Agendada',
    },
    {
      id: 'lead-3',
      fullName: 'Luz Marina Torres',
      phone: '+57 318 123 7890',
      city: 'Bucaramanga',
      roleInterest: 'Consultora de Belleza',
      date: '2026-04-18',
      status: 'Kit Entregado',
    },
  ];

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Reclutamiento & Crecimiento de Red
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Aspirantes Registradas en "Trabaja con nosotros"
            </h2>
            <p className="text-xs text-stone-500">
              Prospectos captados a través del formulario público blindado con Honeypot y Ley 1581 Habeas Data.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Aspirante</th>
                  <th className="p-4">Ciudad</th>
                  <th className="p-4">Interés</th>
                  <th className="p-4">Fecha de Registro</th>
                  <th className="p-4">Habeas Data</th>
                  <th className="p-4 text-right">Contactar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-semibold text-stone-900">
                      <div>{lead.fullName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{lead.phone}</div>
                    </td>
                    <td className="p-4 text-stone-600 flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{lead.city}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-800">{lead.roleInterest}</td>
                    <td className="p-4 text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{lead.date}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Consentimiento OK</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(lead.fullName)}%2C%20te%20escribe%20la%20Directora%20Yuli%20de%20Yanbal%20Prestige.%20Vi%20tu%20postulaci%C3%B3n...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
