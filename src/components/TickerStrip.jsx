export default function TickerStrip({
  items,
  activeTab,
  onTabChange,
  activeSubTab,
  onSubTabChange,
}) {
  const tabs = ["News", "Coins"];
  const subTabs = ["Trending", "New", "MC"];
  const isCoins = activeTab === "Coins";

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-white/10 bg-black/30 backdrop-blur-2xl">
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-3 sm:px-4 py-1 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] transition whitespace-nowrap flex-shrink-0 ${
              tab === activeTab
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isCoins && (
        <div className="border-t border-white/10 bg-black/40 px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {subTabs.map((subTab) => (
              <button
                key={subTab}
                onClick={() => onSubTabChange(subTab)}
                className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium tracking-wide transition whitespace-nowrap flex-shrink-0 ${
                  subTab === activeSubTab
                    ? "bg-[#d4ed31] text-[#050207]"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {subTab}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCoins ? (
        <div className="border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-white/80">
          <div className="flex flex-wrap gap-3">
            {items.map((item) => (
              <div
                key={item.symbol}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-0.9rem)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-white">
                    {item.symbol}
                  </p>
                  <span
                    className={`text-xs ${
                      item.change.startsWith("+")
                        ? "text-[#d4ed31]"
                        : "text-rose-400"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs uppercase tracking-[0.35em] text-white/40">
                  <p>
                    Vol <span className="text-white/80">{item.volume}</span>
                  </p>
                  <p>
                    Price <span className="text-white/80">{item.price}</span>
                  </p>
                  <p>
                    MC <span className="text-white/80">{item.marketCap}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/5">
          <div className="flex w-max gap-8 px-6 py-3 text-sm text-white/70 ticker-track">
            {items.concat(items).map((item, index) => (
              <span
                key={`${item.symbol}-${index}`}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"
              >
                <strong className="text-white">{item.symbol}</strong>
                <span className="text-[#d4ed31]">{item.change}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

