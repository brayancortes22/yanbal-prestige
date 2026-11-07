import React, { useState } from 'react';
import { Users, TrendingUp, Wallet, MessageCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppUser, ConsultantClient, Order } from '../../types';
import { formatCop, getBalance, getPaidAmount } from '../../utils/payments';

interface LeaderTeamPanelProps {
  leader: AppUser;
  team: AppUser[];
  orders: Order[];
  clients: ConsultantClient[];
}

/**
 * Panel de equipo para el rol Líder de zona. Antes el líder no tenía forma
 * de saber qué consultoras dependían de él ni cómo iban sus ventas.
 */
export const LeaderTeamPanel: React.FC<LeaderTeamPanelProps> = ({
  leader,
  team,
  orders,
  clients,
}) => {
  const teamIds = new Set([leader.id, ...team.map((member) => member.id)]);
  const teamOrders = orders.filter((order) => teamIds.has(order.consultantId));

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(team.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleTeam = team.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalSales = teamOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPaid = teamOrders.reduce((sum, order) => sum + getPaidAmount(order), 0);
  const totalBalance = teamOrders.reduce((sum, order) => sum + getBalance(order), 0);

  const metrics = [
    { label: 'Consultoras en mi equipo', value: String(team.length), Icon: Users, tone: 'bg-brand-apricot-soft text-brand-apricot' },
    { label: 'Ventas del equipo', value: formatCop(totalSales), Icon: TrendingUp, tone: 'bg-[#FBF3D9] text-[#8A6D12]' },
    { label: 'Recaudado', value: formatCop(totalPaid), Icon: Wallet, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Saldo por cobrar', value: formatCop(totalBalance), Icon: Wallet, tone: 'bg-stone-100 text-stone-600' },
  ];

  return (
    <section className="space-y-4 rounded-3xl border border-brand-gold/30 bg-white p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-center">
        <div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8A6D12]">
            <ShieldCheck className="h-3.5 w-3.5" /> Panel de líder de zona
          </span>
          <h3 className="font-editorial text-xl font-bold text-stone-900">
            Mi equipo: {leader.name}
          </h3>
          <p className="text-xs text-stone-500">
            Consultoras asignadas por la administradora, con su venta y saldo real.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-semibold text-stone-600">
          {team.length} {team.length === 1 ? 'consultora' : 'consultoras'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-stone-200/80 bg-white p-3.5">
            <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <strong className="block font-editorial text-lg text-stone-900">{value}</strong>
            <span className="text-[10px] text-stone-500">{label}</span>
          </div>
        ))}
      </div>

      {team.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-xs text-stone-500">
          Todavía no tienes consultoras asignadas. La administradora puede asignarlas desde
          <strong> Equipo & Roles → Editar → Líder a cargo</strong>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase text-stone-500">
              <tr>
                <th className="p-3">Consultora</th>
                <th className="p-3">Zona</th>
                <th className="p-3">Clientas</th>
                <th className="p-3">Ventas</th>
                <th className="p-3">Abonado</th>
                <th className="p-3">Saldo</th>
                <th className="p-3 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visibleTeam.map((member) => {
                const memberOrders = teamOrders.filter((order) => order.consultantId === member.id);
                const sales = memberOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                const paid = memberOrders.reduce((sum, order) => sum + getPaidAmount(order), 0);
                const balance = memberOrders.reduce((sum, order) => sum + getBalance(order), 0);
                const memberClients = clients.filter(
                  (client) => client.consultantId === member.id
                ).length;
                const phone = member.phone.replace(/\D/g, '');

                return (
                  <tr key={member.id} className="hover:bg-stone-50/60">
                    <td className="p-3">
                      <p className="font-semibold text-stone-900">{member.name}</p>
                      <p className="text-[10px] text-stone-400">{member.email}</p>
                    </td>
                    <td className="p-3 text-stone-600">{member.zone}</td>
                    <td className="p-3 text-stone-600">{memberClients || '—'}</td>
                    <td className="p-3 font-semibold text-stone-900">{formatCop(sales)}</td>
                    <td className="p-3 text-emerald-700">{formatCop(paid)}</td>
                    <td className="p-3 text-brand-apricot-dark">{formatCop(balance)}</td>
                    <td className="p-3 text-right">
                      {phone ? (
                        <a
                          href={`https://wa.me/57${phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-[10px] text-stone-400">Sin teléfono</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {team.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
          <span className="text-[11px] text-stone-500">
            Mostrando {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, team.length)} de {team.length} consultoras
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <span className="px-2 text-[11px] font-semibold text-stone-700">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 disabled:opacity-40 cursor-pointer"
            >
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
