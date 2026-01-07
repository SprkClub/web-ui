export default function HeroHeader() {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Discover crypto culture in real time
        </h1>
        <span className="rounded-full border border-[#d4ed31]/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#d4ed31]">
          live
        </span>
      </div>
      <p className="mt-3 text-sm text-white/70">
        Drop the X link, we mint keywords into coins, you earn for being early.
      </p>
    </header>
  );
}

