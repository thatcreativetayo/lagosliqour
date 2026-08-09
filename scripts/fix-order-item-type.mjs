// One-time migration: fix order line items that were written with
// `_type: "object"` so they render in the Studio.
//
// The order schema now names the array member `orderItem` (see
// sanity/schemas/order.ts). Older orders stored items as `_type: "object"`,
// which the Studio can't resolve, so the products appear blank on the order.
// This rewrites every order's items[]._type to "orderItem", leaving all other
// item data untouched.
//
// Run:  node scripts/fix-order-item-type.mjs
//
// Requires SANITY_API_WRITE_TOKEN (Editor) in .env.local — same token the app
// uses for order writes.

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const projectId =
  process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion =
  process.env.SANITY_API_VERSION ??
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ??
  "2026-06-09";
const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN."
  );
  process.exit(1);
}

const OLD_TYPE = "object";
const NEW_TYPE = "orderItem";

function headers(extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function queryUrl(query) {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`
  );
  url.searchParams.set("query", query);
  return url.toString();
}

function mutationUrl() {
  return `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
}

async function fetchOrders() {
  // Include drafts too so unpublished orders are fixed as well.
  const query = `*[_type == "order" && count(items[_type == "${OLD_TYPE}"]) > 0]{ _id, items }`;
  const res = await fetch(queryUrl(query), { headers: headers() });
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`);
  const { result } = await res.json();
  return result ?? [];
}

async function commit(mutations) {
  const res = await fetch(mutationUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Mutation failed: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log(`Scanning orders in ${projectId}/${dataset} for legacy item type…`);
  const orders = await fetchOrders();

  if (!orders.length) {
    console.log("Nothing to migrate — no orders with legacy item type found.");
    return;
  }

  console.log(`Found ${orders.length} order(s) to fix.`);

  const mutations = orders.map((order) => ({
    // Replace the whole items array with the same data but corrected _type.
    patch: {
      id: order._id,
      set: {
        items: (order.items ?? []).map((item) =>
          item?._type === OLD_TYPE ? { ...item, _type: NEW_TYPE } : item
        ),
      },
    },
  }));

  // Commit in small batches to stay well under mutation limits.
  const BATCH = 20;
  for (let i = 0; i < mutations.length; i += BATCH) {
    const slice = mutations.slice(i, i + BATCH);
    await commit(slice);
    console.log(`  Patched ${Math.min(i + BATCH, mutations.length)}/${mutations.length}`);
  }

  console.log("Done. Reload the Studio — order items should now render.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
