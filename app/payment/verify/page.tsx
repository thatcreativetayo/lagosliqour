import type { Metadata } from "next";
import PaymentVerifyClient from "./PaymentVerifyClient";

export const metadata: Metadata = {
  title: "Payment Verification | Lagos Liquor",
  description: "Verifying your payment...",
};

export default function PaymentVerifyPage() {
  return <PaymentVerifyClient />;
}
