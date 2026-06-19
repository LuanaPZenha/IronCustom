import { formatCurrency, formatDate, OS_STATUSES } from './constants';

export function buildWhatsAppMessage(order) {
  const isBudget = order.documentType === 'budget';
  const type = isBudget ? 'Orçamento' : 'Ordem de Serviço';
  const v = order.vehicleId;

  const lines = [
    `🏍️ *IRON CUSTOM — ${type}*`,
    `Nº: ${order.orderNumber}`,
    `Data: ${formatDate(order.createdAt)}`,
    `Status: ${OS_STATUSES[order.status]?.label}`,
    '',
    `👤 Cliente: ${order.clientId?.name}`,
    `🛵 Veículo: ${v?.plate} — ${v?.brand} ${v?.model}`,
    '',
    '*Itens:*',
    ...(order.lineItems || []).map(
      (i) => `• ${i.description} (${i.quantity}x ${formatCurrency(i.unitPrice)})`
    ),
  ];

  if (order.laborHours > 0) {
    lines.push(`• Mão de obra: ${order.laborHours}h`);
  }

  lines.push('', `💰 *Total: ${formatCurrency(order.totalAmount)}*`);
  lines.push('', 'Aguardamos sua aprovação! 🔧');

  return lines.join('\n');
}

export function openWhatsApp(phone, message) {
  const cleaned = (phone || '').replace(/\D/g, '');
  const fullPhone = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
