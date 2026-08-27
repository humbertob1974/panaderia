import emailjs from '@emailjs/browser'
import { formatPrice } from './format'

// Envío de correos de confirmación con EmailJS (plan gratuito, sin backend).
// Si las variables no están configuradas, el pedido funciona igual pero
// no se envía correo.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export async function sendOrderConfirmation({ order, orderId, settings }) {
  if (!isEmailConfigured || !order.customer.email) return false

  const items = order.items
    .map((i) => `${i.qty} × ${i.name} — ${formatPrice(i.price * i.qty)}`)
    .join('\n')

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: order.customer.email,
      customer_name: order.customer.name,
      order_id: orderId.slice(0, 8).toUpperCase(),
      items,
      subtotal: formatPrice(order.subtotal),
      delivery_fee: order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Gratis',
      total: formatPrice(order.total),
      address: order.customer.address,
      business_name: settings.name,
      business_phone: settings.phone || settings.whatsapp || '',
    },
    { publicKey: PUBLIC_KEY }
  )
  return true
}
