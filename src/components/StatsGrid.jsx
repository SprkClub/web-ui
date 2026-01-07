export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-black/40 p-3 sm:p-4 text-xs sm:text-sm text-white/70 backdrop-blur-2xl">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4"
        >
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/40">
            {stat.label}
          </p>
          <p className="mt-1 sm:mt-2 text-lg sm:text-xl lg:text-2xl font-semibold text-white">{stat.value}</p>
          <p className="text-[10px] sm:text-xs text-[#d4ed31]">{stat.detail}</p>
        </div>
      ))}
    </div>
  );
}

