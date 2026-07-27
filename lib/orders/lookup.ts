import { groq, sanityFetch } from "@/lib/sanity/client";
import { supabaseServer } from "@/lib/supabase/server";

export interface OrderRecord {
  _id: string;
  reference: string;
  credoReference?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: {
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
  items: unknown[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderDate: string;
  paymentStatus?: string;
  paymentAmountKobo?: number;
  orderStore: "sanity" | "supabase";
}

const sanityOrderQuery = groq`*[_type == "order" && (
  ($reference != "" && reference == $reference) ||
  ($transRef != "" && credoReference == $transRef)
)][0]{
  _id,
  reference,
  credoReference,
  customerName,
  customerEmail,
  customerPhone,
  deliveryAddress,
  items,
  subtotal,
  deliveryFee,
  total,
  orderDate,
  paymentStatus,
  paymentAmountKobo
}`;

async function findSanityOrder(reference: string, transRef: string) {
  const order = await sanityFetch<Omit<OrderRecord, "orderStore"> | null>({
    query: sanityOrderQuery,
    params: { reference, transRef },
    revalidate: 0,
  });

  if (!order || Array.isArray(order)) {
    return null;
  }

  return { ...order, orderStore: "sanity" as const };
}

async function findSupabaseOrder(reference: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    _id: data.id as string,
    reference: data.reference as string,
    customerName: data.customer_name as string,
    customerEmail: data.customer_email as string,
    customerPhone: data.customer_phone as string,
    deliveryAddress: {
      streetAddress: data.street_address as string,
      landmark: (data.landmark as string | null) ?? undefined,
      city: data.city as string,
      state: data.state as string,
    },
    items: (data.items as unknown[]) ?? [],
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    total: Number(data.total),
    orderDate: (data.created_at as string) ?? new Date().toISOString(),
    paymentStatus: data.status === "confirmed" ? "paid" : "pending",
    orderStore: "supabase" as const,
  } satisfies OrderRecord;
}

export async function findOrderByReferenceOrTransRef(
  reference?: string | null,
  transRef?: string | null
): Promise<OrderRecord | null> {
  const normalizedReference = reference?.trim() ?? "";
  const normalizedTransRef = transRef?.trim() ?? "";

  if (!normalizedReference && !normalizedTransRef) {
    return null;
  }

  const sanityOrder = await findSanityOrder(normalizedReference, normalizedTransRef);
  if (sanityOrder) {
    return sanityOrder;
  }

  if (normalizedReference) {
    return findSupabaseOrder(normalizedReference);
  }

  return null;
}
