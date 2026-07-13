import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/stores/cart";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CustomerEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
}

function generateCustomerEmailHTML(data: CustomerEmailData): string {
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
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .success-banner {
            background: linear-gradient(135deg, #6d1b1a 0%, #8b2929 100%);
            color: #efece4;
            padding: 25px;
            text-align: center;
          }
          .success-banner h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .order-ref {
            background-color: #6d1b1a15;
            border: 2px solid #6d1b1a;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .order-ref .label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6d1b1a80;
            margin-bottom: 5px;
          }
          .order-ref .value {
            color: #6d1b1a;
            font-size: 24px;
            font-weight: 700;
          }
          .section {
            margin: 25px 0;
          }
          .section-title {
            color: #6d1b1a;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .item {
            padding: 15px 0;
            border-bottom: 1px solid #6d1b1a10;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-name {
            font-weight: 600;
            color: #291315;
            margin-bottom: 5px;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #29131580;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #6d1b1a10;
          }
          .total-row {
            font-size: 20px;
            font-weight: 700;
            color: #6d1b1a;
            padding: 20px 0 10px 0;
            border-top: 2px solid #6d1b1a;
            margin-top: 10px;
          }
          .info-box {
            background-color: #6d1b1a05;
            padding: 15px;
            border-left: 3px solid #6d1b1a;
            margin: 20px 0;
          }
          .footer {
            background-color: #efece4;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #29131580;
          }
          .button {
            display: inline-block;
            background-color: #6d1b1a;
            color: #efece4;
            padding: 12px 30px;
            text-decoration: none;
            text-transform: uppercase;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lagos Liquor</h1>
          </div>
          
          <div class="success-banner">
            <h2>✓ Thank You for Your Order!</h2>
            <p>We're preparing your premium selection</p>
          </div>

          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Thank you for shopping with Lagos Liquor! Your order has been received and is being processed.</p>

            <div class="order-ref">
              <div class="label">Your Order Reference</div>
              <div class="value">${data.orderId}</div>
            </div>

            <div class="section">
              <div class="section-title">Order Items</div>
              ${data.items.map((item) => `
                <div class="item">
                  <div class="item-name">${item.title}</div>
                  <div class="item-details">
                    <span>Quantity: ${item.quantity}</span>
                    <span>₦${item.lineTotal.toLocaleString()}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₦${data.subtotal.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Fee</span>
                <span>${data.deliveryFee === 0 ? 'FREE' : '₦' + data.deliveryFee.toLocaleString()}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total Amount</span>
                <span>₦${data.total.toLocaleString()}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Delivery Address</div>
              <div class="info-box">
                ${data.streetAddress}${data.landmark ? ', ' + data.landmark : ''}<br>
                ${data.city}, ${data.state}
              </div>
            </div>

            <div class="info-box" style="background-color: #FFF3CD; border-left-color: #FFC107;">
              <strong>Next Steps:</strong><br>
              • Complete your bank transfer if you haven't already<br>
              • Send us a WhatsApp message with payment proof<br>
              • We'll confirm and ship your order within 72 hours<br>
            </div>

            <center>
              <a href="https://wa.me/2348083703793?text=Hi%20Lagos%20Liquor%2C%20I%20need%20help%20with%20order%20${data.orderId}" class="button">
                Contact Us on WhatsApp
              </a>
            </center>

            <p style="margin-top: 30px; font-size: 14px; color: #29131580;">
              Need help? Reply to this email or reach out via WhatsApp. We're here to ensure you have the best experience!
            </p>
          </div>

          <div class="footer">
            <p><strong>Lagos Liquor</strong></p>
            <p>Premium Wines & Spirits</p>
            <p style="margin-top: 15px;">WhatsApp: +234 808 370 3793</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json({ 
        error: "Email service unavailable" 
      }, { status: 503 });
    }

    const body: CustomerEmailData = await request.json();

    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Lagos Liquor <customercare@lagosliquor.com>",
      to: body.customerEmail,
      subject: `Order Confirmation - ${body.orderId}`,
      html: generateCustomerEmailHTML(body),
    });

    console.log("Customer email sent:", emailResult);

    return NextResponse.json({ 
      success: true, 
      emailId: emailResult.data?.id 
    });
  } catch (error) {
    console.error("Customer email error:", error);
    return NextResponse.json({ 
      error: "Failed to send email",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
