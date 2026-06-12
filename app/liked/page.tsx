import type { Metadata } from "next";
import LikedClient from "./LikedClient";

export const metadata: Metadata = {
  title: "Liked Wines | Lagos Liquor",
  description: "Your saved wine collection.",
};

export default function LikedPage() {
  return <LikedClient />;
}
