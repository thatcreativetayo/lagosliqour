import Image from "next/image";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "About | Lagos Liquor",
  description: "Our story — premium wines curated for Lagos.",
};

export default function AboutPage() {
  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-eyebrow text-wine mb-6">Our Story</p>
            <h1 className="text-heading-1 font-display font-normal text-ink mb-6">
              Wine for the
              <br />
              Lagos evening.
            </h1>
            <p className="text-body text-ink/70 mb-6">
              Lagos Liquor was founded on a simple belief: that the right bottle
              transforms an evening. We source directly from estates in Bordeaux,
              Burgundy, Champagne, and beyond — then deliver across Lagos with the
              care your collection deserves.
            </p>
            <p className="text-body text-ink/70 mb-8">
              Every shipment is temperature-controlled. Every bottle is authentic.
              Every delivery is same-day across the island.
            </p>
            <Button href="/shop">Explore the Collection →</Button>
          </div>
          <div className="relative aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=900&q=85"
              alt="Wine cellar"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
