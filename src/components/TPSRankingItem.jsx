import Image from "next/image";
import Link from "next/link";
import GoldenCheckmark from "./GoldenCheckmark";

export default function TPSRankingItem({ item, rank }) {
  const username = item.handle.replace('@', '');

  const getRankIcon = () => {
    if (rank === 1) {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-pink-400"
        >
          <path
            d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z"
            fill="currentColor"
          />
        </svg>
      );
    } else if (rank === 2) {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-orange-400"
        >
          <path
            d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z"
            fill="currentColor"
          />
        </svg>
      );
    } else if (rank === 3) {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-green-400"
        >
          <path
            d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z"
            fill="currentColor"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-[50px_1fr_100px_80px] sm:grid-cols-[60px_1fr_120px_100px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 items-center hover:bg-white/5 transition min-w-max">
      <div className="flex items-center gap-1 sm:gap-2">
        {getRankIcon()}
        <span className="text-sm sm:text-base font-semibold text-white">{rank}</span>
      </div>

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

      <div className="text-xs sm:text-sm text-white/80">{item.followers}</div>
      <div className="text-xs sm:text-sm font-semibold text-[#d4ed31]">{item.tps}</div>
    </div>
  );
}

