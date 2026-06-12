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

export function addCartItem(item: Omit<CartItem, "lineTotal">) {
  const state = getSnapshot();
  const existing = state.items.find((cartItem) => cartItem.wineId === item.wineId);

  const items = existing
    ? state.items.map((cartItem) =>
        cartItem.wineId === item.wineId
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

export function removeCartItem(wineId: string) {
  const state = getSnapshot();
  const items = state.items.filter((item) => item.wineId !== wineId);
  writeCart({ items });
}

export function updateCartItemQuantity(wineId: string, quantity: number) {
  const state = getSnapshot();
  const items = state.items.map((item) =>
    item.wineId === wineId
      ? { ...item, quantity, lineTotal: quantity * item.unitPrice }
      : item
  );
  writeCart({ items });
}

export function clearCart() {
  writeCart(emptyState);
}

export function useCartStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const subtotal = state.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: state.items,
    subtotal,
    count,
    addItem: addCartItem,
    removeItem: removeCartItem,
    updateQuantity: updateCartItemQuantity,
    clearCart,
  };
}
