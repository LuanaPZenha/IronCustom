import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate, OS_STATUSES, PAYMENT_METHODS, FUEL_LEVELS } from './constants';

export function generateOrderPdf(order) {
  const doc = new jsPDF();
  const isBudget = order.documentType === 'budget';
  const title = isBudget ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO';

  doc.setFontSize(18);
  doc.setTextColor(234, 88, 12);
  doc.text('IRON CUSTOM — Oficina de Motos', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 32);
  doc.setFontSize(10);
  doc.text(`Nº ${order.orderNumber}`, 14, 40);
  doc.text(`Data: ${formatDate(order.createdAt)}`, 14, 46);
  doc.text(`Status: ${OS_STATUSES[order.status]?.label || order.status}`, 14, 52);

  let y = 62;
  doc.setFontSize(11);
  doc.text('CLIENTE', 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Nome: ${order.clientId?.name || '—'}`, 14, y);
  y += 5;
  doc.text(`Telefone: ${order.clientId?.phone || '—'}`, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text('VEÍCULO', 14, y);
  y += 6;
  doc.setFontSize(10);
  const v = order.vehicleId;
  doc.text(`Placa: ${v?.plate || '—'} | ${v?.brand} ${v?.model} (${v?.year})`, 14, y);
  y += 5;
  doc.text(`Cor: ${v?.color || '—'} | Chassi: ${v?.chassis || '—'}`, 14, y);
  y += 10;

  if (order.checklist?.mileage || order.checklist?.fuelLevel) {
    doc.setFontSize(11);
    doc.text('CHECKLIST DE ENTRADA', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`KM: ${order.checklist.mileage || '—'} | Combustível: ${FUEL_LEVELS[order.checklist.fuelLevel] || '—'}`, 14, y);
    y += 10;
  }

  doc.setFontSize(11);
  doc.text('ITENS', 14, y);
  y += 6;
  doc.setFontSize(9);
  (order.lineItems || []).forEach((item) => {
    doc.text(
      `${item.description} — ${item.quantity}x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`,
      14,
      y
    );
    y += 5;
  });

  if (order.laborHours > 0) {
    y += 3;
    doc.text(
      `Mão de obra: ${order.laborHours}h x ${formatCurrency(order.laborRate)} = ${formatCurrency(order.laborHours * order.laborRate)}`,
      14,
      y
    );
    y += 5;
  }

  y += 5;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(order.totalAmount)}`, 14, y);

  if (order.payment?.method) {
    y += 8;
    doc.setFontSize(10);
    doc.text(`Pagamento: ${PAYMENT_METHODS[order.payment.method]} | Pago: ${order.payment.paid ? 'Sim' : 'Não'}`, 14, y);
  }

  doc.save(`${order.orderNumber}.pdf`);
}
