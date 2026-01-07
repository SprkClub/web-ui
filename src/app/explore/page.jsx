"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
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

function TokenCard({ token }) {
  const isPositive = token.change >= 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-white/20 transition cursor-pointer group">
      <div className="flex items-center gap-3 mb-3">
        {/* Token Icon */}
        <div className="w-12 h-12 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {token.image ? (
            <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-[#d4ed31]">{token.symbol?.charAt(1) || "?"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{token.symbol}</span>
            {token.isVerified && (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-white/50 truncate">{token.name}</p>
        </div>
        {/* Change % */}
        <div className={`text-right ${isPositive ? "text-green-400" : "text-red-400"}`}>
          <span className="font-medium">{isPositive ? "+" : ""}{token.change?.toFixed(2)}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-white/40 text-xs mb-0.5">Price</p>
          <p className="text-white font-medium">{token.price}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs mb-0.5">Volume</p>
          <p className="text-white font-medium">{token.volume}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs mb-0.5">Market Cap</p>
          <p className="text-white font-medium">{token.marketCap}</p>
        </div>
      </div>

      {/* Creator */}
      {token.creator && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden">
            {token.creator.image ? (
              <img src={token.creator.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Icons.User size={12} className="text-white/50 m-auto mt-1" />
            )}
          </div>
          <span className="text-xs text-white/50">by @{token.creator.username}</span>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTokens();
  }, [activeFilter]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      // Fetch tokens from API
      const response = await fetch(`/api/tokens?filter=${activeFilter}`, {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
      } else {
        setTokens([]);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter tokens by search query
  const filteredTokens = tokens.filter((token) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      token.symbol?.toLowerCase().includes(query) ||
      token.name?.toLowerCase().includes(query) ||
      token.creator?.username?.toLowerCase().includes(query)
    );
  });

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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Explore</h1>
            <p className="text-white/50">Discover trending tokens and creators</p>
          </div>

          {/* Search */}
          <div className="flex-shrink-0">
            <div className="relative max-w-xl">
              <Icons.Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens, creators..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
            {[
              { id: "all", label: "All" },
              { id: "trending", label: "Trending" },
              { id: "new", label: "New" },
              { id: "featured", label: "Featured" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex-shrink-0 ${
                  activeFilter === filter.id
                    ? "bg-[#d4ed31] text-[#050207]"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Tokens Grid */}
          <main className="no-scrollbar flex-1 overflow-y-auto pb-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4ed31]"></div>
                  <p className="mt-4 text-white/50">Loading tokens...</p>
                </div>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Icons.Search size={32} className="text-white/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No tokens found</h3>
                  <p className="text-white/50">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "Tokens will appear here once they are added."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTokens.map((token) => (
                  <TokenCard key={token.id || token._id} token={token} />
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
