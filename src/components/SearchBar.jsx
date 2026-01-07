export default function SearchBar() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-2xl">
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-[#d4ed31]/40 focus:outline-none"
            placeholder="search for a trend / a creator / a link / a CA"
          />
          <span className="pointer-events-none absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-white/40 text-xs sm:text-sm hidden sm:block">
            ⌘K
          </span>
        </div>
        <button className="rounded-xl sm:rounded-2xl border border-white/15 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white/80 transition hover:border-white/40 whitespace-nowrap">
          EN
        </button>
      </div>
    </div>
  );
}

