import Image from "next/image";

export default function RankingItem({ item, rank }) {
  return (
    <div className="group flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
      <div className="flex flex-shrink-0 items-center justify-center rounded-lg bg-white/5 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-bold text-white">
        {rank}
      </div>

      <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <span className="text-sm sm:text-base font-semibold text-white truncate">
              {item.symbol}
            </span>
            <span className="text-xs sm:text-sm text-white/70 line-clamp-1 hidden sm:block">
              {item.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-white/60 truncate">{item.user}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#d4ed31] flex-shrink-0 sm:w-3 sm:h-3"
            >
              <path
                d="M6 0L7.2858 4.7142L12 6L7.2858 7.2858L6 12L4.7142 7.2858L0 6L4.7142 4.7142L6 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {item.thumbnail && (
          <div className="flex-shrink-0 hidden sm:block">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-lg border border-white/10">
              <Image
                src={item.thumbnail}
                alt={item.symbol}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-shrink-0 text-right">
          <div className="text-sm sm:text-base font-semibold text-[#d4ed31]">
            {item.value}
          </div>
        </div>
      </div>
    </div>
  );
}

