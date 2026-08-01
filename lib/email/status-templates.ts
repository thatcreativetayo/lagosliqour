// Status-update emails sent to the customer when the store owner changes an
// order's status in the Sanity Studio. Reuses the brand palette / table markup
// established in app/api/orders/send-confirmation/route.ts.

export interface StatusEmailOrder {
  reference: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  total?: number;
  deliveryAddress?: {
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
}

// Statuses that trigger a customer email. Others (pending / cancelled / failed)
// intentionally do not notify the customer.
type NotifiableStatus = "confirmed" | "processing" | "shipped" | "delivered";

const COPY: Record<
  NotifiableStatus,
  { subject: (ref: string) => string; heading: string; body: string }
> = {
  confirmed: {
    subject: (ref) => `Your order is confirmed - ${ref}`,
    heading: "Order Confirmed",
    body: "Great news — your order has been confirmed and payment received. We're getting it ready for you.",
  },
  processing: {
    subject: (ref) => `We're preparing your order - ${ref}`,
    heading: "Order Processing",
    body: "Your order is now being prepared. We'll let you know as soon as it's on the way.",
  },
  shipped: {
    subject: (ref) => `Your order is on its way - ${ref}`,
    heading: "Order Shipped",
    body: "Your order has left our store and is on its way to you. Please have someone available to receive it.",
  },
  delivered: {
    subject: (ref) => `Your order has been delivered - ${ref}`,
    heading: "Order Delivered",
    body: "Your order has been delivered. We hope you enjoy your selection — cheers from all of us at Lagos Liquor!",
  },
};

export const NOTIFIABLE_STATUSES: NotifiableStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export function isNotifiableStatus(status: string): status is NotifiableStatus {
  return (NOTIFIABLE_STATUSES as string[]).includes(status);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusEmailHTML(
  order: StatusEmailOrder,
  copy: { heading: string; body: string }
): string {
  const name = escapeHtml(order.customerName || "there");
  const reference = escapeHtml(order.reference);
  const addr = order.deliveryAddress;
  const addressBlock = addr
    ? `
              <h2 style="margin: 0 0 15px; color: #291315; font-size: 18px; text-transform: uppercase;">
                Delivery Address
              </h2>
              <div style="padding: 20px; background-color: #ffffff; border-left: 4px solid #6d1b1a; margin-bottom: 30px;">
                <p style="margin: 0; color: #291315; line-height: 1.6;">
                  ${escapeHtml(addr.streetAddress || "")}${addr.landmark ? `, ${escapeHtml(addr.landmark)}` : ""}<br>
                  ${escapeHtml(addr.city || "")}${addr.state ? `, ${escapeHtml(addr.state)}` : ""}
                </p>
              </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #efece4; border: 2px solid #6d1b1a;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background-color: #6d1b1a;">
              <h1 style="margin: 0; color: #efece4; font-size: 32px; text-transform: uppercase; letter-spacing: 1px;">
                ${escapeHtml(copy.heading)}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #291315; font-size: 16px;">
                Dear ${name},
              </p>

              <p style="margin: 0 0 30px; color: #291315; font-size: 16px; line-height: 1.6;">
                ${escapeHtml(copy.body)}
              </p>

              <!-- Order Reference -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #ffffff; border: 1px solid #6d1b1a;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6d1b1a; font-size: 12px; text-transform: uppercase; opacity: 0.7;">
                      Order Reference
                    </p>
                    <p style="margin: 0; color: #6d1b1a; font-size: 24px; font-weight: bold;">
                      ${reference}
                    </p>
                  </td>
                </tr>
              </table>

              ${addressBlock}

              <p style="margin: 0 0 20px; color: #291315; font-size: 14px; line-height: 1.6;">
                Questions about your order? Just reply to this email and we'll help you out.
              </p>

              <p style="margin: 0; color: #291315; font-size: 14px;">
                Cheers,<br>
                <strong>Lagos Liquor Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #6d1b1a; background-color: #291315;">
              <p style="margin: 0 0 10px; color: #efece4; font-size: 12px;">
                © ${new Date().getFullYear()} Lagos Liquor. All rights reserved.
              </p>
              <p style="margin: 0; color: #efece4; font-size: 12px; opacity: 0.7;">
                Premium wines and spirits delivered across Lagos.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Build the subject + HTML for a status-update email, or return null when the
 * status is not one the customer should be emailed about.
 */
export function statusEmail(
  status: string,
  order: StatusEmailOrder
): { subject: string; html: string } | null {
  if (!isNotifiableStatus(status)) {
    return null;
  }

  const copy = COPY[status];
  return {
    subject: copy.subject(order.reference),
    html: statusEmailHTML(order, copy),
  };
}
