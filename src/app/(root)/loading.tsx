export default function CatalogueLoading() {
  return (
    <main
      className="min-h-[calc(100svh-4.5rem)] animate-pulse bg-[#e8f7f1] px-4 py-8 font-jost sm:px-6 lg:px-8"
      aria-label="Loading catalogue"
      aria-busy="true"
    >
      <div className="mx-auto grid min-h-[calc(100svh-8.5rem)] max-w-[94rem] items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="h-4 w-40 rounded-full bg-dark-900/10" />
          <div className="mt-6 h-16 max-w-xl rounded-3xl bg-dark-900/10 sm:h-24" />
          <div className="mt-3 h-16 max-w-md rounded-3xl bg-dark-900/8" />
          <div className="mt-7 h-12 w-44 rounded-full bg-dark-900/12" />
        </div>
        <div className="mx-auto aspect-[0.76] w-[min(68vw,21rem)] rounded-[3rem] bg-dark-900/15" />
      </div>
    </main>
  );
}
