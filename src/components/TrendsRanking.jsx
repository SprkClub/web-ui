export default function TrendsRanking({ rankings }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50">
          Trending Tokens
        </p>
        <button className="text-[10px] sm:text-xs text-white/60">See more</button>
      </div>
      <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
        {rankings.map((trend, index) => (
          <div key={trend.symbol} className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-white truncate">
                {index + 1}. {trend.symbol}
              </span>
              <span className="text-white/70 flex-shrink-0 ml-2">{trend.value}</span>
            </div>
            <div className="h-1 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#d4ed31]"
                style={{
                  width: `${90 - index * 12}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

