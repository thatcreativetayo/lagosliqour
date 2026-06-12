import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Lagos Liquor",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
