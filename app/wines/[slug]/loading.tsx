export default function LoadingWinePage() {
  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-7 aspect-square bg-wine/5" />
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="h-5 w-28 bg-wine/10" />
          <div className="h-16 w-full bg-wine/10" />
          <div className="h-24 w-full bg-wine/5" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-wine/5" />
            <div className="h-24 bg-wine/5" />
          </div>
        </div>
      </div>
    </main>
  );
}
