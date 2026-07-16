export default function CatalogueLoading() {
  return (
    <main
      className="min-h-[calc(100svh-4.5rem)] animate-pulse bg-light-200 font-jost"
      aria-label="Loading catalogue"
      aria-busy="true"
    >
      <section className="bg-[#0d1714] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[94rem]">
          <div className="h-3 w-44 rounded-full bg-white/10" />
          <div className="mt-6 h-20 max-w-3xl rounded-3xl bg-white/10 sm:h-28" />
          <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-[1.35rem] bg-white/[0.07]" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[94rem]">
          <div className="h-12 max-w-xl rounded-2xl bg-dark-900/10" />
          <div className="mt-9 h-36 rounded-[1.6rem] bg-dark-900/8" />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[0.78] rounded-[1.75rem] bg-dark-900/8"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
