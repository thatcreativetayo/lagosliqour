// Quick test script to verify Resend API is working
import { config } from 'dotenv';
config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("✓ RESEND_API_KEY found:", RESEND_API_KEY.substring(0, 10) + "...");

const testData = {
  orderId: "TEST-" + Date.now(),
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  customerPhone: "+2348012345678",
  items: [
    {
      wineId: "test-1",
      title: "Test Wine",
      price: 25000,
      quantity: 2,
      lineTotal: 50000,
      image: null
    }
  ],
  total: 52000
};

console.log("\n🧪 Testing email API endpoint...");
console.log("Order ID:", testData.orderId);

try {
  const response = await fetch("http://localhost:3000/api/orders/bank-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testData),
  });

  const result = await response.json();
  
  console.log("\n📨 Response Status:", response.status);
  console.log("📨 Response Data:", JSON.stringify(result, null, 2));

  if (response.ok) {
    console.log("\n✅ Email sent successfully!");
  } else {
    console.log("\n❌ Email failed to send");
  }
} catch (error) {
  console.error("\n❌ Request failed:", error.message);
  console.log("\n💡 Make sure the dev server is running: npm run dev");
}
