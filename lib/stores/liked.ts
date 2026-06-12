"use client";

import { useSyncExternalStore } from "react";

const LIKED_KEY = "lagos-liquor-liked-wines";
const listeners = new Set<() => void>();

// Initialize snapshot once
let snapshot: string[] = [];
let isInitialized = false;

function getSnapshot(): string[] {
  // Only read from localStorage once on first call
  if (!isInitialized && typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LIKED_KEY);
      snapshot = stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      snapshot = [];
    }
    isInitialized = true;
  }
  
  return snapshot;
}

function getServerSnapshot(): string[] {
  return [];
}

function writeLikedIds(ids: string[]) {
  snapshot = ids;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function likeWine(id: string) {
  const ids = getSnapshot();
  if (!ids.includes(id)) writeLikedIds([...ids, id]);
}

export function unlikeWine(id: string) {
  writeLikedIds(getSnapshot().filter((likedId) => likedId !== id));
}

export function isLiked(id: string) {
  return getSnapshot().includes(id);
}

export function getLikedIds() {
  return getSnapshot();
}

export function clearLiked() {
  writeLikedIds([]);
}

export function useLikedStore() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ids,
    likeWine,
    unlikeWine,
    isLiked: (id: string) => ids.includes(id),
    getLikedIds: () => ids,
    clearLiked,
  };
}
