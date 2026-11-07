import type { Order } from '../types';
import {
  PAYMENT_METHOD_LABELS,
  formatCop,
  getBalance,
  getPaidAmount,
} from './payments';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Construye una factura HTML autónoma (A4) para imprimir o guardar como PDF.
 * No hereda estilos del panel, así que el resultado es un documento limpio y
 * no una "captura" de la pantalla del sistema.
 */
export const buildInvoiceHtml = (order: Order): string => {
  const paid = getPaidAmount(order);
  const balance = getBalance(order);
  const date = new Date(order.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td class="mono">${escapeHtml(item.productCode)}</td>
          <td>${escapeHtml(item.productName)}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatCop(item.unitPrice)}</td>
          <td class="right strong">${formatCop(item.subtotal)}</td>
        </tr>`
    )
    .join('');

  const paymentRows =
    order.payments && order.payments.length > 0
      ? order.payments
          .map(
            (payment) => `
            <tr>
              <td>${new Date(payment.date).toLocaleDateString('es-CO')}</td>
              <td>${escapeHtml(PAYMENT_METHOD_LABELS[payment.method])}</td>
              <td>${escapeHtml(payment.note || '—')}</td>
              <td class="right strong">${formatCop(payment.amount)}</td>
            </tr>`
          )
          .join('')
      : `<tr><td colspan="4" class="muted">Sin pagos registrados.</td></tr>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Factura ${escapeHtml(order.invoiceNumber)} — Yanbal Prestige</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1c1917; font: 12px/1.5 "Segoe UI", Arial, sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b241d; padding-bottom: 14px; }
  .brand { font-family: Georgia, "Times New Roman", serif; font-size: 26px; font-weight: 700; letter-spacing: .5px; }
  .brand span { color: #c94a27; font-style: italic; }
  .brand small { display: block; margin-top: 2px; font: 9px Arial, sans-serif; letter-spacing: 2px; color: #78716c; text-transform: uppercase; }
  .doc { text-align: right; }
  .doc h1 { margin: 0 0 4px; font: 700 18px Georgia, serif; letter-spacing: 1px; }
  .doc p { margin: 2px 0; color: #57534e; }
  .doc .number { font-family: Consolas, monospace; font-weight: 700; color: #1c1917; }
  .parties { display: flex; gap: 18px; margin: 18px 0; }
  .party { flex: 1; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px 12px; }
  .party h2 { margin: 0 0 4px; font: 700 9px Arial, sans-serif; letter-spacing: 1.5px; text-transform: uppercase; color: #78716c; }
  .party p { margin: 1px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #f5f5f4; text-align: left; font: 700 9px Arial, sans-serif; letter-spacing: 1px; text-transform: uppercase; color: #57534e; padding: 7px 8px; border-bottom: 1px solid #d6d3d1; }
  td { padding: 7px 8px; border-bottom: 1px solid #e7e5e4; vertical-align: top; }
  .center { text-align: center; }
  .right { text-align: right; }
  .strong { font-weight: 700; }
  .mono { font-family: Consolas, monospace; color: #57534e; white-space: nowrap; }
  .muted { color: #a8a29e; }
  .totals { display: flex; justify-content: flex-end; margin-top: 14px; }
  .totals table { width: 270px; }
  .totals td { border: none; padding: 4px 8px; }
  .totals .total td { border-top: 2px solid #3b241d; padding-top: 8px; font-size: 15px; font-weight: 700; }
  .payments-title { margin: 18px 0 4px; font: 700 10px Arial, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; color: #57534e; }
  .footer { margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 10px; font-size: 9px; color: #78716c; line-height: 1.6; }
  .footer strong { color: #44403c; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <header class="header">
    <div class="brand">YANBAL <span>Prestige</span><small>Comunidad de belleza</small></div>
    <div class="doc">
      <h1>FACTURA DE VENTA</h1>
      <p class="number">${escapeHtml(order.invoiceNumber)}</p>
      <p>${escapeHtml(date)}</p>
      <p>${order.source === 'web_catalogo' ? 'Catálogo web' : 'Venta directa'}</p>
    </div>
  </header>

  <section class="parties">
    <div class="party">
      <h2>Clienta</h2>
      <p><strong>${escapeHtml(order.clientName)}</strong></p>
      <p>Tel: ${escapeHtml(order.clientPhone)}</p>
      ${order.clientEmail ? `<p>Correo: ${escapeHtml(order.clientEmail)}</p>` : ''}
      ${order.clientDocumentId ? `<p>Documento: ${escapeHtml(order.clientDocumentId)}</p>` : ''}
      <p>${escapeHtml(order.clientCity)}${order.clientNeighborhood ? ` · Barrio ${escapeHtml(order.clientNeighborhood)}` : ''}${order.clientAddress ? ` · ${escapeHtml(order.clientAddress)}` : ''}${order.clientPostalCode ? ` · CP ${escapeHtml(order.clientPostalCode)}` : ''}</p>
    </div>
    <div class="party">
      <h2>Consultora</h2>
      <p><strong>${escapeHtml(order.consultantName)}</strong></p>
      <p>Red independiente Yanbal Prestige</p>
      <p>Estado: ${order.paymentStatus === 'pagado' ? 'Pagado' : order.paymentStatus === 'anulada' ? 'Anulada' : order.paymentStatus === 'abono' ? 'Con abono' : 'Pendiente'}</p>
    </div>
  </section>

  <table>
    <thead>
      <tr><th>SKU</th><th>Producto</th><th class="center">Cant.</th><th class="right">Unitario</th><th class="right">Subtotal</th></tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Total</td><td class="right strong">${formatCop(order.totalAmount)}</td></tr>
      <tr><td>Pagado / abonado</td><td class="right">${formatCop(paid)}</td></tr>
      <tr class="total"><td>Saldo</td><td class="right">${formatCop(balance)}</td></tr>
    </table>
  </div>

  <h2 class="payments-title">Pagos registrados</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Método</th><th>Nota</th><th class="right">Monto</th></tr></thead>
    <tbody>${paymentRows}</tbody>
  </table>

  ${order.notes ? `<p class="muted"><strong>Nota:</strong> ${escapeHtml(order.notes)}</p>` : ''}

  <footer class="footer">
    <strong>Yanbal Prestige</strong> · Comunidad independiente de Consultoras y Directoras autorizadas.<br />
    Este documento es un comprobante interno de la red. Las marcas y productos son propiedad de Yanbal International.<br />
    Datos tratados conforme a la Ley 1581 de 2012 (Habeas Data Colombia). Documento generado el ${escapeHtml(new Date().toLocaleString('es-CO'))}.
  </footer>
</body>
</html>`;
};

/** Abre la factura en una ventana limpia y lanza el diálogo Imprimir/PDF. */
export const printInvoice = (order: Order): boolean => {
  const html = buildInvoiceHtml(order);
  const win = window.open('', '_blank', 'width=900,height=760');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  window.setTimeout(() => {
    win.print();
  }, 350);
  return true;
};
