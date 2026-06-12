import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/stores/cart";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  state: string;
  city: string;
  streetAddress: string;
  landmark?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

function generateOrderEmailHTML(order: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #291315;
          background-color: #efece4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 2px solid #6d1b1a;
        }
        .header {
          background-color: #6d1b1a;
          color: #efece4;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .content {
          padding: 30px;
        }
        .order-ref {
          background-color: #6d1b1a15;
          border: 1px solid #6d1b1a20;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .order-ref strong {
          color: #6d1b1a;
          font-size: 18px;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          color: #6d1b1a;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #6d1b1a10;
        }
        .item:last-child {
          border-bottom: none;
        }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: 600;
          color: #291315;
          margin-bottom: 4px;
        }
        .item-qty {
          font-size: 14px;
          color: #29131580;
        }
        .item-price {
          font-weight: 600;
          color: #6d1b1a;
        }
        .totals {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 2px solid #6d1b1a;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-row.grand {
          font-size: 20px;
          font-weight: 700;
          color: #6d1b1a;
          padding-top: 15px;
          border-top: 1px solid #6d1b1a20;
        }
        .address {
          background-color: #6d1b1a05;
          padding: 15px;
          border-left: 3px solid #6d1b1a;
        }
        .footer {
          background-color: #efece4;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #29131580;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lagos Liquor</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Order Confirmation</p>
        </div>
        
        <div class="content">
          <p>Hello ${order.customerName},</p>
          <p>Thank you for your order! We've received your payment and your premium wines are being prepared for delivery.</p>
          
          <div class="order-ref">
            <div class="section-title">Order Reference</div>
            <strong>${order.reference}</strong>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            ${order.items.map((item) => `
              <div class="item">
                <div class="item-details">
                  <div class="item-name">${item.title}</div>
                  <div class="item-qty">Quantity: ${item.quantity}</div>
                </div>
                <div class="item-price">₦${item.lineTotal.toLocaleString()}</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₦${order.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee === 0 ? 'Free' : `₦${order.deliveryFee.toLocaleString()}`}</span>
            </div>
            <div class="total-row grand">
              <span>TOTAL</span>
              <span>₦${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Delivery Address</div>
            <div class="address">
              <strong>${order.customerName}</strong><br>
              ${order.streetAddress}<br>
              ${order.landmark ? `${order.landmark}<br>` : ''}
              ${order.city}, ${order.state}<br>
              ${order.customerPhone}
            </div>
          </div>

          <div class="section">
            <p style="margin-top: 30px; font-size: 14px; color: #29131580;">
              We'll contact you shortly to confirm delivery details. Your wines will be delivered temperature-controlled for optimal quality.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>Lagos Liquor | Premium Wines & Spirits</p>
          <p>For inquiries, contact lagosliqour@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const orderData: OrderEmailData = await request.json();

    // Send to customer
    await resend.emails.send({
      from: "Lagos Liquor <orders@lagosliquor.com>",
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.reference}`,
      html: generateOrderEmailHTML(orderData),
    });

    // Send to admin
    await resend.emails.send({
      from: "Lagos Liquor <orders@lagosliquor.com>",
      to: "lagosliqour@gmail.com",
      subject: `New Order - ${orderData.reference}`,
      html: generateOrderEmailHTML(orderData),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
