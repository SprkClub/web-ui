export default function NewsCard({ item }) {
  return (
    <article className="card-glow rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#d4ed31]/40 to-transparent text-base sm:text-lg font-semibold text-[#d4ed31] flex-shrink-0">
              {item.author.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold truncate">{item.author}</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/50 truncate">
                {item.handle} · {item.time}
              </p>
            </div>
          </div>
          <p className="mt-3 sm:mt-5 text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-white">
            {item.headline}
          </p>
        </div>
        <button className="rounded-full border border-[#d4ed31]/30 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-[#d4ed31] transition hover:border-[#d4ed31] whitespace-nowrap flex-shrink-0">
          Buy
        </button>
      </div>
      <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-white/70">
        <Badge label={`Vol ${item.volume}`} color="bg-[#d4ed31]" />
        <Badge label={`Price ${item.price}`} color="bg-white/70" />
        <Badge label={`MC ${item.marketCap}`} color="bg-[#4c5259]" />
      </div>
    </article>
  );
}

function Badge({ label, color }) {
  return (
    <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2">
      <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

