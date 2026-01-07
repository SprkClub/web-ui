"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLoginModal } from "@/contexts/LoginModalContext";
import RequireAuth from "@/components/RequireAuth";
import { Icons } from "@/lib/icons";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

export default function CoinsPage() {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const { openModal } = useLoginModal();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("marketCap");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    fetchCoins();
  }, [activeFilter, sortBy]);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/coins/list?filter=${activeFilter}&sortBy=${sortBy}`
      );
      const data = await response.json();
      if (data.success) {
        setCoins(data.data.coins);
      }
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "movers", label: "Movers" },
    { id: "live", label: "Live" },
    { id: "new", label: "New" },
    { id: "marketCap", label: "Market cap" },
    { id: "mayhem", label: "Mayhem" },
    { id: "oldest", label: "Oldest" },
    { id: "lastReply", label: "Last reply" },
    { id: "lastTrade", label: "Last trade" },
  ];

  return (
    <RequireAuth>
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      <div className="orb absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#d4ed31]/50 hidden lg:block" />
      <div className="orb absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#4c5259] hidden lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-5xl mx-auto">
          {/* Top Bar with Search, Create Coin, and Login */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/create-coin"
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition text-sm sm:text-base whitespace-nowrap"
              >
                Create coin
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={openModal}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm sm:text-base whitespace-nowrap"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
          
          <main className="no-scrollbar flex flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Now trending</h1>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-white/80 hover:bg-white/10 transition hidden sm:block">
                  Filter
                </button>
                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
                >
                  {viewMode === "grid" ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
                      <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
                      <rect x="2" y="2" width="16" height="2" fill="currentColor"/>
                      <rect x="2" y="9" width="16" height="2" fill="currentColor"/>
                      <rect x="2" y="16" width="16" height="2" fill="currentColor"/>
                    </svg>
                  )}
                </button>
                <button className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition hidden sm:block">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    if (filter.id === "marketCap") {
                      setSortBy("marketCap");
                    } else {
                      setActiveFilter(filter.id);
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition flex-shrink-0 ${
                    activeFilter === filter.id || sortBy === filter.id
                      ? "bg-[#d4ed31] text-[#050207]"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Coins Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
                  <p className="mt-4 text-gray-400">Loading coins...</p>
                </div>
              </div>
            ) : coins.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <p className="text-lg sm:text-xl text-white/60">No coins found</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {coins.map((coin) => (
                  <Link
                    key={coin.id}
                    href={`/coin/${coin.id}`}
                    className="group rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition cursor-pointer"
                  >
                    {/* Coin Image */}
                    <div className="relative w-full h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden bg-white/5">
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icons.Image size={48} className="text-[#d4ed31]" />
                        </div>
                      )}
                      {coin.isMayhem && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#d4ed31] text-[#050207] text-xs font-bold">
                          MAYHEM
                        </div>
                      )}
                    </div>

                    {/* Coin Info */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#d4ed31] transition">
                          {coin.name}
                        </h3>
                        <p className="text-sm text-white/60">{coin.symbol}</p>
                      </div>

                      {coin.description && (
                        <p className="text-sm text-white/80 line-clamp-2">
                          {coin.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/60">Market Cap</p>
                          <p className="text-sm font-semibold text-white">
                            {formatMarketCap(coin.marketCap)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">Replies</p>
                          <p className="text-sm font-semibold text-white">
                            {formatNumber(coin.replies)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

