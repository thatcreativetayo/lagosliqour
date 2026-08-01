import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", {
    title: "Contact | Lagos Liquor",
    description:
      "Get in touch with Lagos Liquor. Questions about delivery, gifting, or membership? Our team responds within hours.",
    path: "/contact",
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
