import Button from "@/components/ui/Button";

export default function WineNotFound() {
  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <h1 className="text-5xl font-normal text-ink uppercase">Wine not found</h1>
        <p className="text-body text-ink/60 mt-4 mb-8 max-w-lg mx-auto">
          This bottle is no longer available in the collection.
        </p>
        <Button href="/shop">Browse Wines</Button>
      </div>
    </main>
  );
}
