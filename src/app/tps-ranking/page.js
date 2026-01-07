"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TPSRankingItem from "@/components/TPSRankingItem";
import { Icons } from "@/lib/icons";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

const categories = [
  "Junk.Fun Genesis",
  "Project 索拉拉 Genesis",
  "America.Fun Genesis",
];

const tpsRankingData = [
  {
    id: 1,
    name: "sunflower.edge",
    handle: "@tyhvip",
    followers: "16.39K",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 2,
    name: "zo",
    handle: "@zosphotos",
    followers: "17.44K",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 3,
    name: "Star@Day1Global Podcast",
    handle: "@starzqeth",
    followers: "41.27K",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 4,
    name: "林不凡",
    handle: "@CHh352h",
    followers: "6.36K",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 5,
    name: "Sooooda dream",
    handle: "@SoooodaDream",
    followers: "258",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 6,
    name: "王溯洄",
    handle: "@WangSuhui666",
    followers: "614",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 7,
    name: "BABA BULLA",
    handle: "@bababulla",
    followers: "1.12K",
    tps: "10.0",
    avatar: "/api/placeholder/40/40",
  },
];

export default function TPSRankingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Junk.Fun Genesis");

  return (
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      <div className="orb absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#d4ed31]/50 hidden lg:block" />
      <div className="orb absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#4c5259] hidden lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-4xl mx-auto">
          <div className="flex flex-1 flex-col gap-4 min-h-0 h-full">
            <SearchBar />
            <main className="no-scrollbar flex flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto pb-6 min-h-0 h-full">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#d4ed31] to-[#eaff5f] bg-clip-text text-transparent">
                  Trends Points
                </h1>
                <Flame size={24} className="text-[#d4ed31] sm:w-8 sm:h-8" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                      activeCategory === category
                        ? "bg-[#d4ed31] text-[#050207]"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-white/60">
                <span className="break-words">Period: Oct 29 09:00-Oct 30 09:00</span>
                <button className="text-[#d4ed31] hover:text-[#eaff5f] transition whitespace-nowrap">
                  View Rules
                </button>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 overflow-hidden overflow-x-auto">
                <div className="grid grid-cols-[50px_1fr_100px_80px] sm:grid-cols-[60px_1fr_120px_100px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/60 border-b border-white/10 min-w-max">
                  <div>Rank</div>
                  <div>Name</div>
                  <div className="flex items-center gap-1">
                    X Followers
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L3 6L6 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1">
                    TPS
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L3 6L6 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="divide-y divide-white/10">
                  {tpsRankingData.map((item, index) => (
                    <TPSRankingItem key={item.id} item={item} rank={index + 1} />
                  ))}
                </div>

                <div className="border-t border-white/10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-white"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <span className="text-sm text-white/80">
                        Log in with X to check details
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white/60"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

