import { Order } from './types';

/**
 * Cleans phone number string to pure country code digits format for wa.me URL
 * Example: "+91 98250 12345" -> "919825012345"
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Generates WhatsApp URL for Order Creation Confirmation
 */
export function getOrderCreatedWhatsAppUrl(order: Order): string {
  const phone = formatPhoneForWhatsApp(order.customer_phone);

  const itemsList = order.items
    .map((item, idx) => `  ${idx + 1}. *${item.item_name}* (${item.dimensions}) — *${item.required_qty} pcs*`)
    .join('\n');

  const text = `*ASHAPURI TUFF — FACTORY ORDER CONFIRMATION* 🏭
_Strengthening Your Glass_

Dear *${order.customer_name}*,
Your glass processing order has been created and entered into production.

📋 *Order Number:* ${order.order_number}
📅 *Expected Delivery:* ${order.expected_delivery}
⚡ *Priority:* ${order.priority}

📦 *Glass Specifications:*
${itemsList}

For any queries, please reply directly to this message.
*Ashapuri Tuff Processing Unit*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates WhatsApp URL for Order Dispatch Advice
 */
export function getOrderDispatchedWhatsAppUrl(
  order: Order,
  vehicleNumber?: string,
  dispatchNote?: string
): string {
  const phone = formatPhoneForWhatsApp(order.customer_phone);

  const itemsList = order.items
    .map((item, idx) => `  ${idx + 1}. *${item.item_name}* (${item.dimensions}) — *${item.required_qty} pcs*`)
    .join('\n');

  const totalQty = order.items.reduce((acc, i) => acc + i.required_qty, 0);
  const vehicle = vehicleNumber || order.dispatch_vehicle || 'N/A';
  const note = dispatchNote || order.dispatch_note || 'Packed in wooden frames & verified.';

  const text = `*ASHAPURI TUFF — DISPATCH ADVICE* 🚛
_Strengthening Your Glass_

Dear *${order.customer_name}*,
Your toughened glass order has been verified and loaded for dispatch!

📋 *Order Number:* ${order.order_number}
🚛 *Transport Vehicle:* ${vehicle}
📦 *Total Units:* ${totalQty} pcs
📝 *Dispatch Note:* ${note}

📦 *Dispatched Items:*
${itemsList}

Please inspect glass sheets upon site unloading.
Thank you for choosing *Ashapuri Tuff*!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp link in new tab safely
 */
export function openWhatsApp(url: string) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
