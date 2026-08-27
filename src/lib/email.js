import emailjs from '@emailjs/browser'
import { formatPrice } from './format'

// Envío de correos de confirmación con EmailJS (plan gratuito, sin backend).
// El cuerpo del correo se construye aquí como HTML (la plantilla de EmailJS
// solo contiene {{{message_html}}}), así el diseño se controla desde el código.
// Si las variables no están configuradas, el pedido funciona igual pero
// no se envía correo.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

// Los clientes de correo (Gmail, Outlook) bloquean imágenes incrustadas,
// así que el logo se sirve desde la página publicada en GitHub Pages.
// Si cambias el logo del negocio, reemplaza también public/email-logo.png.
const LOGO_URL = 'https://pompansat.com/email-logo.png'

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function buildOrderEmailHtml({ order, orderId, settings }) {
  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e6d6;font-size:14px;color:#44403c;">
            ${escapeHtml(i.name)}
            <span style="color:#a8a29e;">&times; ${i.qty}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f0e6d6;font-size:14px;color:#44403c;white-space:nowrap;">
            ${formatPrice(i.price * i.qty)}
          </td>
        </tr>`
    )
    .join('')

  const contactLine = [settings.phone, settings.email]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' &nbsp;·&nbsp; ')

  return `
  <div style="margin:0;padding:24px 12px;background-color:#faf6ef;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <!-- Encabezado -->
      <tr>
        <td style="background-color:#78350f;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="${escapeHtml(settings.name)}" width="110" style="display:block;margin:0 auto 14px;width:110px;max-width:110px;border-radius:16px;" />
          <p style="margin:0;font-size:26px;font-weight:bold;color:#fffbeb;letter-spacing:1px;">${escapeHtml(settings.name)}</p>
          ${settings.slogan ? `<p style="margin:6px 0 0;font-size:13px;color:#fcd9a8;">${escapeHtml(settings.slogan)}</p>` : ''}
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="background-color:#ffffff;padding:32px;border:1px solid #ece4d4;border-top:none;">
          <p style="margin:0 0 4px;font-size:18px;color:#292524;font-weight:bold;">Hemos recibido su pedido</p>
          <p style="margin:0 0 20px;font-size:14px;color:#78716c;line-height:1.6;">
            Estimado(a) ${escapeHtml(order.customer.name)}:<br/>
            Gracias por su preferencia. Su pedido ha sido registrado y ya se encuentra en proceso.
            Nos pondremos en contacto con usted para coordinar la entrega.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr>
              <td style="background-color:#fef3c7;border-radius:8px;padding:8px 16px;font-size:13px;color:#92400e;">
                N&uacute;mero de pedido: <strong>${escapeHtml(orderId.slice(0, 8).toUpperCase())}</strong>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px;">Resumen del pedido</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
            <tr>
              <td style="padding:12px 0 2px;font-size:14px;color:#78716c;">Subtotal</td>
              <td align="right" style="padding:12px 0 2px;font-size:14px;color:#78716c;">${formatPrice(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:2px 0;font-size:14px;color:#78716c;">Env&iacute;o</td>
              <td align="right" style="padding:2px 0;font-size:14px;color:#78716c;">${order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Gratis'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0;font-size:16px;color:#292524;font-weight:bold;border-top:2px solid #78350f;">Total</td>
              <td align="right" style="padding:10px 0 0;font-size:16px;color:#78350f;font-weight:bold;border-top:2px solid #78350f;">${formatPrice(order.total)}</td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
            <tr>
              <td style="background-color:#faf6ef;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px;">Direcci&oacute;n de entrega</p>
                <p style="margin:0;font-size:14px;color:#44403c;line-height:1.5;">${escapeHtml(order.customer.address)}</p>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
            El pago se realiza al momento de recibir su pedido.<br/>
            Si tiene alguna duda, responda a este correo o comun&iacute;quese con nosotros.
          </p>
        </td>
      </tr>
      <!-- Pie -->
      <tr>
        <td style="background-color:#f5efe3;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #ece4d4;border-top:none;">
          <p style="margin:0;font-size:13px;color:#78350f;font-weight:bold;">${escapeHtml(settings.name)}</p>
          ${contactLine ? `<p style="margin:6px 0 0;font-size:12px;color:#a8a29e;">${contactLine}</p>` : ''}
          <p style="margin:6px 0 0;font-size:12px;color:#a8a29e;">Gracias por su compra</p>
        </td>
      </tr>
    </table>
  </div>`
}

export async function sendOrderConfirmation({ order, orderId, settings }) {
  if (!isEmailConfigured || !order.customer.email) return false

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: order.customer.email,
      customer_name: order.customer.name,
      order_id: orderId.slice(0, 8).toUpperCase(),
      business_name: settings.name,
      message_html: buildOrderEmailHtml({ order, orderId, settings }),
    },
    { publicKey: PUBLIC_KEY }
  )
  return true
}
