import { WINES } from "@/lib/data/wines";
import WineCard from "@/components/ui/WineCard";

export default function ProductGrid() {
  const featured = WINES.filter((w) => w.featured);

  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-12 sm:mb-16">
          <p className="text-eyebrow text-wine mb-4">Featured Wines</p>
          <h2 className="text-heading-1 font-display font-normal text-ink">
            The Selection.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8">
          {featured.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      </div>
    </section>
  );
}
