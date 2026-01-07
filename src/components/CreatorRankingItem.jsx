import Image from "next/image";
import Link from "next/link";
import GoldenCheckmark from "./GoldenCheckmark";

export default function CreatorRankingItem({ item, rank }) {
  const username = item.handle.replace('@', '');

  return (
    <div className="grid grid-cols-[50px_1fr_100px_100px_100px_80px] sm:grid-cols-[60px_1fr_120px_120px_120px_100px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 items-center hover:bg-white/5 transition min-w-max">
      <div className="text-sm sm:text-base font-semibold text-white">{rank}</div>

      <Link href={`/creator/${username}`} className="flex items-center gap-2 sm:gap-3 group">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
          <Image
            src={item.avatar}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d4ed31] transition truncate">{item.name}</span>
            <GoldenCheckmark size={14} />
          </div>
          <div className="text-[10px] sm:text-xs text-white/60 truncate">{item.handle}</div>
        </div>
      </Link>

      <div className="text-xs sm:text-sm font-semibold text-[#d4ed31]">{item.rewards}</div>
      <div className="text-xs sm:text-sm text-white/80">{item.volume}</div>
      <div className="text-xs sm:text-sm text-white/80">{item.followers}</div>
      <div>
        <button className="rounded-lg border border-white/20 bg-white/5 px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white/80 hover:bg-white/10 transition">
          Subscribe
        </button>
      </div>
    </div>
  );
}

