"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NewsletterModal from "../home/NewsletterModal";
import SmoothScroll from "../providers/SmoothScroll";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <SmoothScroll />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <NewsletterModal />
    </>
  );
}
