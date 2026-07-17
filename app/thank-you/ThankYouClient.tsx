"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, WhatsappLogo } from "@phosphor-icons/react";

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderRef = searchParams.get("ref") ?? "";
  const isPaid = searchParams.get("paid") === "1";

  useEffect(() => {
    if (!orderRef) {
      router.push("/shop");
    }
  }, [orderRef, router]);

  if (!orderRef) {
    return null;
  }

  return (
    <main className="bg-cream min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <CheckCircle size={80} weight="fill" className="text-wine" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-lg sm:text-xl text-ink/70 mb-8">
            {isPaid ? "Your payment is confirmed and your order is being prepared" : "Your order is being processed"}
          </p>

          <div className="bg-wine/5 border-2 border-wine/20 p-6 sm:p-8 mb-8">
            <p className="text-xs uppercase text-wine/70 mb-2">Order Reference</p>
            <p className="text-2xl sm:text-3xl font-bold text-wine font-mono">{orderRef}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 mb-10"
        >
          <div className="bg-white border-2 border-wine/10 p-6">
            <div className="flex items-start gap-4">
              <Package size={32} className="text-wine shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-ink mb-2">What Happens Next?</h3>
                <ol className="text-sm sm:text-base text-ink/70 space-y-2 list-decimal list-inside">
                  <li>Check your email for order confirmation and details</li>
                  {isPaid ? null : <li>Complete your bank transfer if you haven&apos;t already</li>}
                  {isPaid ? null : <li>Send us payment proof via WhatsApp</li>}
                  <li>We&apos;ll confirm your order and prepare it for delivery</li>
                  <li>Your premium selection will be delivered within 24-48 hours</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-gold/10 border-2 border-gold/30 p-6">
            <h3 className="text-lg font-semibold text-ink mb-3">Need Help?</h3>
            <p className="text-sm sm:text-base text-ink/70 mb-4">
              Our team is ready to assist you with your order. Reach out via WhatsApp for instant support!
            </p>
            <a
              href={`https://wa.me/2348083703793?text=Hi%20Lagos%20Liquor%2C%20I%20need%20help%20with%20order%20${orderRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 hover:bg-[#20BA5A] transition-colors"
            >
              <WhatsappLogo size={24} weight="fill" />
              <span>Contact Us on WhatsApp</span>
            </a>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-wine text-cream px-8 py-3 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 text-center"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="border-2 border-wine/20 text-dark px-8 py-3 hover:border-wine hover:text-wine transition-all duration-300 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
