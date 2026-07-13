import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders | Lagos Liquor",
  description: "View your order history.",
};

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return <OrdersClient />;
}
