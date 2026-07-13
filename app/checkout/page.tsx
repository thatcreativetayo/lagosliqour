import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Lagos Liquor",
  description: "Complete your order.",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutClient />;
}
