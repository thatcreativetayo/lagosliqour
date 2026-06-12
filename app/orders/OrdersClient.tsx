"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  wineId: string;
  slug: string;
  title: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  id: string;
  reference: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  state: string;
  city: string;
  street_address: string;
  landmark?: string;
  delivery_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export default function OrdersClient() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const response = await fetch(`/api/orders/user?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center">
            <p className="text-sm sm:text-body text-ink/60">Loading your orders...</p>
          </div>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">My Orders</h1>
            <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4 max-w-lg mx-auto px-4">
              You haven't placed any orders yet.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/shop"
              className="bg-wine text-cream px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 text-sm sm:text-base"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">My Orders</h1>
          <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4">
            {orders.length} {orders.length === 1 ? "order" : "orders"} found
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6 lg:space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-wine/10 bg-wine/5 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 mb-5 sm:mb-6">
                <div>
                  <p className="text-xs uppercase text-wine/70">Order Reference</p>
                  <p className="text-lg sm:text-xl font-medium text-wine mt-1">{order.reference}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs uppercase text-wine/70">Date</p>
                    <p className="text-xs sm:text-sm text-dark mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-wine/70">Status</p>
                    <span
                      className={`inline-block mt-1 px-2 sm:px-3 py-1 text-xs uppercase ${
                        order.status === "confirmed"
                          ? "bg-gold/20 text-dark"
                          : order.status === "failed"
                          ? "bg-wine/20 text-wine"
                          : "bg-ink/10 text-ink/60"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-wine/70">Total</p>
                    <p className="text-base sm:text-lg font-semibold text-wine mt-1">
                      ₦{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-wine/10 pt-4 sm:pt-6">
                <p className="text-xs uppercase text-wine/70 mb-3 sm:mb-4">Items</p>
                <div className="space-y-3 sm:space-y-4">
                  {order.items.map((item, index) => (
                    <div key={`${item.wineId}-${index}`} className="flex gap-3 sm:gap-4">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-wine/10 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain p-1.5 sm:p-2"
                            sizes="64px"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <div>
                          <Link
                            href={`/wines/${item.slug}`}
                            className="text-dark font-medium hover:text-wine transition-colors text-sm sm:text-base line-clamp-2 sm:line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-ink/60">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-dark font-medium text-sm sm:text-base">
                          ₦{item.lineTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-wine/10 mt-4 sm:mt-6 pt-4 sm:pt-6">
                <p className="text-xs uppercase text-wine/70 mb-2 sm:mb-3">Delivery Address</p>
                <p className="text-dark text-xs sm:text-sm">
                  {order.street_address}
                  {order.landmark ? `, ${order.landmark}` : ""}
                  <br />
                  {order.city}, {order.state}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
