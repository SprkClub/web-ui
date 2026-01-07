import Link from "next/link";
import GoldenCheckmark from "./GoldenCheckmark";

export default function TopCreators({ creators }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50">
          Top Creators
        </p>
        <Link href="/top-creators" className="text-[10px] sm:text-xs text-white/60 hover:text-[#d4ed31] transition">See more</Link>
      </div>
      <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
        {creators.map((creator, idx) => {
          const username = creator.handle.replace('@', '');
          return (
            <Link
              key={creator.handle}
              href={`/creator/${username}`}
              className="flex items-center gap-2 sm:gap-3 hover:bg-white/5 -mx-2 px-2 py-1.5 rounded-lg transition"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-xs sm:text-sm font-semibold flex-shrink-0">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-semibold truncate">{creator.name}</p>
                  <GoldenCheckmark size={12} />
                </div>
                <p className="text-[10px] sm:text-xs text-white/50 truncate">{creator.handle}</p>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-[#d4ed31] flex-shrink-0">
                {creator.rewards}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

