import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/stores/cart";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderConfirmationData {
  reference: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
  };
}

function generateOrderEmailHTML(data: OrderConfirmationData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #efece4;">
        <p style="margin: 0; color: #291315; font-weight: 500;">${item.title}</p>
        <p style="margin: 4px 0 0 0; color: #291315; opacity: 0.6; font-size: 14px;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #efece4; text-align: right; color: #291315; font-weight: 500;">
        ₦${item.lineTotal.toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

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
                Order Confirmed
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #291315; font-size: 16px;">
                Dear ${data.customerName},
              </p>
              
              <p style="margin: 0 0 30px; color: #291315; font-size: 16px; line-height: 1.6;">
                Thank you for your order. Your payment has been received and your order is being prepared for delivery.
              </p>

              <!-- Order Reference -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #ffffff; border: 1px solid #6d1b1a;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6d1b1a; font-size: 12px; text-transform: uppercase; opacity: 0.7;">
                      Order Reference
                    </p>
                    <p style="margin: 0; color: #6d1b1a; font-size: 24px; font-weight: bold;">
                      ${data.reference}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Items -->
              <h2 style="margin: 0 0 20px; color: #291315; font-size: 18px; text-transform: uppercase;">
                Order Details
              </h2>
              
              <table role="presentation" style="width: 100%; margin-bottom: 20px; background-color: #ffffff;">
                <thead>
                  <tr>
                    <th style="padding: 12px; border-bottom: 2px solid #6d1b1a; text-align: left; color: #291315; font-size: 14px; text-transform: uppercase;">
                      Item
                    </th>
                    <th style="padding: 12px; border-bottom: 2px solid #6d1b1a; text-align: right; color: #291315; font-size: 14px; text-transform: uppercase;">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #291315;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; color: #291315;">₦${data.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #291315;">Delivery Fee:</td>
                  <td style="padding: 8px 0; text-align: right; color: #291315;">${data.deliveryFee === 0 ? '<span style="color: #6d1b1a;">Free</span>' : `₦${data.deliveryFee.toLocaleString()}`}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 2px solid #6d1b1a; color: #6d1b1a; font-size: 18px; font-weight: bold;">
                    Total:
                  </td>
                  <td style="padding: 12px 0; border-top: 2px solid #6d1b1a; text-align: right; color: #6d1b1a; font-size: 18px; font-weight: bold;">
                    ₦${data.total.toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- Delivery Address -->
              <h2 style="margin: 0 0 15px; color: #291315; font-size: 18px; text-transform: uppercase;">
                Delivery Address
              </h2>
              <div style="padding: 20px; background-color: #ffffff; border-left: 4px solid #6d1b1a; margin-bottom: 30px;">
                <p style="margin: 0; color: #291315; line-height: 1.6;">
                  ${data.deliveryAddress.street}${data.deliveryAddress.landmark ? `, ${data.deliveryAddress.landmark}` : ""}<br>
                  ${data.deliveryAddress.city}, ${data.deliveryAddress.state}
                </p>
              </div>

              <p style="margin: 0 0 20px; color: #291315; font-size: 14px; line-height: 1.6;">
                We'll send you another email when your order is out for delivery. If you have any questions, please reply to this email.
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
                © 2024 Lagos Liquor. All rights reserved.
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

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as OrderConfirmationData;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Send to customer
    await resend.emails.send({
      from: "Lagos Liquor <orders@lagosliquor.com>",
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.reference}`,
      html: generateOrderEmailHTML(data),
    });

    // Send copy to store
    await resend.emails.send({
      from: "Lagos Liquor <orders@lagosliquor.com>",
      to: "lagosliqour@gmail.com",
      subject: `New Order - ${data.reference}`,
      html: generateOrderEmailHTML(data),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send order confirmation:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
