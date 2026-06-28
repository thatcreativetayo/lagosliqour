"use client";

import { useSyncExternalStore } from "react";

export interface CartItem {
  wineId: string;
  slug: string;
  title: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  packSize?: number; // 1 for single, 6 for pack
}

interface CartState {
  items: CartItem[];
}

const CART_KEY = "lagos-liquor-cart";
const emptyState: CartState = { items: [] };
const listeners = new Set<() => void>();

// Initialize snapshot once
let snapshot: CartState = emptyState;
let isInitialized = false;

function getSnapshot(): CartState {
  // Only read from localStorage once on first call
  if (!isInitialized && typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      snapshot = stored ? (JSON.parse(stored) as CartState) : emptyState;
    } catch {
      snapshot = emptyState;
    }
    isInitialized = true;
  }

  return snapshot;
}

function getServerSnapshot(): CartState {
  return emptyState;
}

function writeCart(state: CartState) {
  snapshot = state;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Helper to generate a unique cart item ID
function getCartItemUniqueId(item: Omit<CartItem, "lineTotal">): string {
  return `${item.wineId}-${item.packSize || 1}`;
}

export function addCartItem(item: Omit<CartItem, "lineTotal">) {
  const state = getSnapshot();
  const uniqueId = getCartItemUniqueId(item);

  // Check if exact same item (same wineId and packSize) exists
  const existing = state.items.find(
    (cartItem) => cartItem.wineId === item.wineId && cartItem.packSize === item.packSize
  );

  const items = existing
    ? state.items.map((cartItem) =>
        getCartItemUniqueId(cartItem) === uniqueId
          ? {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity,
              lineTotal: (cartItem.quantity + item.quantity) * cartItem.unitPrice,
            }
          : cartItem,
      )
    : [...state.items, { ...item, lineTotal: item.quantity * item.unitPrice }];

  writeCart({ items });
}

export function removeCartItem(uniqueId: string) {
  const state = getSnapshot();
  const items = state.items.filter((item) => getCartItemUniqueId(item) !== uniqueId);
  writeCart({ items });
}

export function updateCartItemQuantity(uniqueId: string, quantity: number) {
  const state = getSnapshot();
  const items = state.items
    .map((item) => {
      if (getCartItemUniqueId(item) === uniqueId) {
        return {
          ...item,
          quantity,
          lineTotal: quantity * item.unitPrice,
        };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  writeCart({ items });
}

export function clearCart() {
  writeCart(emptyState);
}

export function useCartStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const subtotal = state.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Group items by wineId to show distinct products
  const groupedItems = state.items.reduce((acc, item) => {
    if (!acc[item.wineId]) {
      acc[item.wineId] = [];
    }
    acc[item.wineId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return {
    items: state.items,
    groupedItems,
    subtotal,
    count,
    addItem: addCartItem,
    removeItem: removeCartItem,
    updateQuantity: updateCartItemQuantity,
    clearCart,
    getCartItemUniqueId,
  };
}
