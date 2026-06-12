import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders | Lagos Liquor",
  description: "View your order history.",
};

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <OrdersClient />;
}
