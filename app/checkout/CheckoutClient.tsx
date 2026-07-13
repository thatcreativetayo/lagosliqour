"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useCartStore } from "@/lib/stores/cart";
import { checkoutSchema, NIGERIAN_STATES, type CheckoutFormData } from "@/lib/validations/checkout";
import type { CreateOrderRequest } from "@/app/api/orders/route";
import BankTransferModal from "@/components/checkout/BankTransferModal";

const DELIVERY_FEE = 2000;
const FREE_DELIVERY_THRESHOLD = 50000;

export default function CheckoutClient() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const cart = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "transfer">("transfer");
  const [showBankModal, setShowBankModal] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [customerData, setCustomerData] = useState<CheckoutFormData | null>(null);

  const deliveryFee = cart.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = cart.subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/shop");
    }
  }, [cart.items.length, router]);

  // Show loading state
  if (!isLoaded) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center">
            <p className="text-sm sm:text-body text-ink/60">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show sign-in prompt
  if (!isSignedIn) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">Checkout</h1>
          </div>
          <div className="max-w-md mx-auto bg-wine/5 border-2 border-wine/20 p-8">
            <h2 className="text-xl font-semibold text-ink mb-4">Sign In Required</h2>
            <p className="text-base text-ink/70 mb-6">
              Please sign in to complete your order. This helps us track your orders and provide better service.
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-wine text-cream px-8 py-3 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 mb-4">
                Sign In to Continue
              </button>
            </SignInButton>
            <button
              onClick={() => router.push("/cart")}
              className="w-full border-2 border-wine/20 text-dark px-8 py-3 hover:border-wine hover:text-wine transition-all duration-300"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </main>
    );
  }

  async function onSubmit(data: CheckoutFormData) {
    setSubmitting(true);

    try {
      console.log("=== Starting Checkout Process ===");
      console.log("Payment Method:", paymentMethod);
      
      const orderData: CreateOrderRequest = {
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        state: data.state,
        city: data.city,
        streetAddress: data.streetAddress,
        landmark: data.landmark,
        deliveryNotes: data.deliveryNotes,
        items: cart.items,
        subtotal: cart.subtotal,
        deliveryFee,
        total,
      };

      console.log("Creating order with data:", { 
        customerName: orderData.customerName, 
        itemCount: orderData.items.length,
        total: orderData.total 
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create order");
      }

      const { orderId, reference } = await response.json();
      console.log("Order created successfully:", { orderId, reference });
      
      setOrderReference(reference);
      setCustomerData(data);

      if (paymentMethod === "transfer") {
        console.log("Showing bank transfer modal");
        // Show bank transfer modal
        setShowBankModal(true);
        setSubmitting(false);
      } else {
        // Online payment (Credopal)
        const paymentResponse = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference,
            orderId,
            amount: total,
            email: data.email,
            customerName: data.fullName,
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error("Failed to initiate payment");
        }

        const { authorizationUrl } = await paymentResponse.json();
        window.location.href = authorizationUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleBankTransferConfirm() {
    if (!customerData) return;

    try {
      console.log("=== Processing Bank Transfer Order ===");
      console.log("Order Reference:", orderReference);
      console.log("Customer:", customerData.fullName);

      // Send email to store owner - WAIT for it to complete
      const ownerEmailResponse = await fetch("/api/orders/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderReference,
          customerName: customerData.fullName,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          items: cart.items,
          total,
        }),
      });

      const ownerEmailResult = await ownerEmailResponse.json();
      console.log("Owner Email Response:", ownerEmailResult);

      if (!ownerEmailResponse.ok) {
        console.error("Owner email failed:", ownerEmailResult);
      }

      // Send confirmation email to customer - WAIT for it to complete
      const customerEmailResponse = await fetch("/api/orders/send-customer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderReference,
          customerName: customerData.fullName,
          customerEmail: customerData.email,
          items: cart.items,
          subtotal: cart.subtotal,
          deliveryFee,
          total,
          streetAddress: customerData.streetAddress,
          landmark: customerData.landmark,
          city: customerData.city,
          state: customerData.state,
        }),
      });

      const customerEmailResult = await customerEmailResponse.json();
      console.log("Customer Email Response:", customerEmailResult);

      if (!customerEmailResponse.ok) {
        console.error("Customer email failed:", customerEmailResult);
      }

      // Clear cart
      cart.clearCart();

      // Redirect to thank you page (user can click WhatsApp button there)
      router.push(`/thank-you?ref=${orderReference}`);
    } catch (error) {
      console.error("Bank transfer confirmation error:", error);
      alert(`Failed to process order: ${error instanceof Error ? error.message : "Unknown error"}. Please contact us directly.`);
    }
  }

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 sm:gap-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-ink uppercase mb-4 sm:mb-6">
                  Customer Details
                </h2>
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-xs uppercase text-wine/70 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      {...register("fullName")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                    {errors.fullName ? (
                      <p className="text-xs text-wine mt-1">{errors.fullName.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs uppercase text-wine/70 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                    {errors.email ? (
                      <p className="text-xs text-wine mt-1">{errors.email.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs uppercase text-wine/70 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="+234"
                      {...register("phone")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                    {errors.phone ? (
                      <p className="text-xs text-wine mt-1">{errors.phone.message}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-ink uppercase mb-4 sm:mb-6">
                  Delivery Address
                </h2>
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="state" className="block text-xs uppercase text-wine/70 mb-2">
                      State *
                    </label>
                    <select
                      id="state"
                      {...register("state")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    >
                      <option value="">Select a state</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state ? (
                      <p className="text-xs text-wine mt-1">{errors.state.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-xs uppercase text-wine/70 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      {...register("city")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                    {errors.city ? (
                      <p className="text-xs text-wine mt-1">{errors.city.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="streetAddress" className="block text-xs uppercase text-wine/70 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      {...register("streetAddress")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                    {errors.streetAddress ? (
                      <p className="text-xs text-wine mt-1">{errors.streetAddress.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="landmark" className="block text-xs uppercase text-wine/70 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      id="landmark"
                      placeholder="e.g. near Access Bank, Wuse 2"
                      {...register("landmark")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="deliveryNotes" className="block text-xs uppercase text-wine/70 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      id="deliveryNotes"
                      rows={3}
                      {...register("deliveryNotes")}
                      className="w-full border border-wine/20 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-dark focus:border-wine focus:outline-none resize-none text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-ink uppercase mb-4 sm:mb-6">
                  Payment Method
                </h2>
                <div className="flex flex-col gap-4">
                  <label
                    className={`border-2 p-4 cursor-pointer transition-all ${
                      paymentMethod === "transfer"
                        ? "border-wine bg-wine/5"
                        : "border-wine/20 hover:border-wine/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={(e) => setPaymentMethod(e.target.value as "online" | "transfer")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-dark font-medium">Bank Transfer</span>
                          <span className="text-xs bg-wine text-cream px-2 py-0.5 uppercase">
                            Fastest Option
                          </span>
                        </div>
                        <p className="text-xs text-ink/60 mt-1">
                          Pay directly to our bank account. We'll process your order once payment is confirmed.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`border-2 p-4 cursor-not-allowed opacity-50 ${
                      paymentMethod === "online"
                        ? "border-wine bg-wine/5"
                        : "border-wine/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        disabled
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value as "online" | "transfer")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-dark font-medium">Online Payment</span>
                          <span className="text-xs bg-ink/20 text-dark px-2 py-0.5 uppercase">
                            Unavailable
                          </span>
                        </div>
                        <p className="text-xs text-ink/60 mt-1">
                          Currently unavailable due to technical issues.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-wine text-cream py-2.5 sm:py-3 px-6 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {submitting ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-wine/5 p-5 sm:p-6 lg:p-8 lg:sticky lg:top-32">
              <h2 className="text-xl sm:text-2xl font-normal text-ink uppercase mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                {cart.items.map((item) => (
                  <div key={item.wineId} className="flex gap-3 sm:gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-wine/5 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain p-2"
                          sizes="80px"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-dark font-medium text-sm sm:text-base">{item.title}</p>
                        <p className="text-xs text-ink/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-dark font-medium text-sm sm:text-base">
                        ₦{item.lineTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-wine/10 pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-dark text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>₦{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-dark text-sm sm:text-base">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-wine">Free</span>
                    ) : (
                      `₦${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                {cart.subtotal < FREE_DELIVERY_THRESHOLD ? (
                  <p className="text-xs text-ink/60">
                    Add ₦{(FREE_DELIVERY_THRESHOLD - cart.subtotal).toLocaleString()} more for free
                    delivery
                  </p>
                ) : null}
                <div className="flex justify-between text-wine text-lg sm:text-xl font-semibold pt-2 sm:pt-3 border-t border-wine/10">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankTransferModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onConfirm={handleBankTransferConfirm}
        orderAmount={total}
        orderId={orderReference}
      />
    </main>
  );
}
