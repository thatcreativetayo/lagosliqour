import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/stores/cart";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BankTransferEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
}

function generateBankTransferEmailHTML(data: BankTransferEmailData): string {
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
          .alert {
            background: #FFF3CD;
            border-left: 4px solid #FFC107;
            padding: 15px;
            margin: 20px 0;
          }
          .alert strong {
            display: block;
            margin-bottom: 5px;
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
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #6d1b1a10;
          }
          .info-label {
            color: #29131580;
            font-size: 14px;
          }
          .info-value {
            font-weight: 600;
            color: #291315;
          }
          .item {
            padding: 12px 0;
            border-bottom: 1px solid #6d1b1a10;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-name {
            font-weight: 600;
            color: #291315;
            margin-bottom: 4px;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #29131580;
          }
          .total {
            font-size: 24px;
            font-weight: 700;
            color: #6d1b1a;
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            background-color: #6d1b1a10;
            border: 2px solid #6d1b1a;
          }
          .bank-details {
            background-color: #6d1b1a05;
            padding: 20px;
            border-left: 3px solid #6d1b1a;
            margin: 20px 0;
          }
          .bank-row {
            padding: 8px 0;
          }
          .bank-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #29131580;
            margin-bottom: 4px;
          }
          .bank-value {
            font-size: 16px;
            font-weight: 600;
            color: #291315;
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
            <p style="margin: 10px 0 0 0; font-size: 14px;">New Bank Transfer Order</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚠️ Payment Pending</strong>
              Customer has initiated a bank transfer. Please verify payment before processing the order.
            </div>
            
            <div class="order-ref">
              <div class="section-title">Order Reference</div>
              <strong>${data.orderId}</strong>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${data.customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${data.customerEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">${data.customerPhone}</span>
              </div>
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

            <div class="total">
              TOTAL AMOUNT: ₦${data.total.toLocaleString()}
            </div>

            <div class="section">
              <div class="section-title">Expected Bank Details</div>
              <div class="bank-details">
                <div class="bank-row">
                  <div class="bank-label">Bank Name</div>
                  <div class="bank-value">Moniepoint MFB</div>
                </div>
                <div class="bank-row">
                  <div class="bank-label">Account Name</div>
                  <div class="bank-value">Lagos Liquor Nig Ltd</div>
                </div>
                <div class="bank-row">
                  <div class="bank-label">Account Number</div>
                  <div class="bank-value">4005681483</div>
                </div>
              </div>
            </div>

            <div class="section">
              <p style="font-size: 14px; color: #29131580; margin-top: 30px;">
                <strong>Next Steps:</strong><br>
                1. Check your bank account for transfer with reference: ${data.orderId}<br>
                2. Customer will send WhatsApp message with payment proof<br>
                3. Verify payment amount matches: ₦${data.total.toLocaleString()}<br>
                4. Once verified, process and ship the order
              </p>
            </div>
          </div>

          <div class="footer">
            <p>Lagos Liquor | Order Management System</p>
            <p>This is an automated notification</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Bank Transfer Email API Called ===");
    
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json({ 
        error: "Email service unavailable",
        message: "RESEND_API_KEY environment variable is not set"
      }, { status: 503 });
    }

    const body: BankTransferEmailData = await request.json();
    console.log("Order data received:", {
      orderId: body.orderId,
      customerName: body.customerName,
      itemCount: body.items.length,
      total: body.total
    });

    // Send email to store owner using Resend free tier format
    console.log("Attempting to send email to abiodunariyo2018@gmail.com");
    
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "abiodunariyo2018@gmail.com",
      subject: `New Bank Transfer Order - ${body.orderId}`,
      html: generateBankTransferEmailHTML(body),
    });

    console.log("Email sent successfully:", emailResult);

    return NextResponse.json({ 
      success: true, 
      emailId: emailResult.data?.id,
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Bank transfer email error:", error);
    return NextResponse.json({ 
      error: "Failed to send email",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error
    }, { status: 500 });
  }
}
 