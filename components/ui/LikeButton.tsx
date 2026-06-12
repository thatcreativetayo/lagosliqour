"use client";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLikedStore } from "@/lib/stores/liked";

interface LikeButtonProps {
  wineId: string;
  className?: string;
}

export default function LikeButton({ wineId, className = "" }: LikeButtonProps) {
  const liked = useLikedStore();
  const active = liked.isLiked(wineId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from liked wines" : "Save wine"}
      aria-pressed={active}
      onClick={() => (active ? liked.unlikeWine(wineId) : liked.likeWine(wineId))}
      className={`border border-wine text-wine hover:bg-wine hover:text-cream transition-all duration-300 p-2.5 cursor-pointer ${active ? "bg-wine text-cream" : ""} ${className}`}
    >
      <HugeiconsIcon
        icon={FavouriteIcon}
        strokeWidth={2}
        className="size-4"
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
