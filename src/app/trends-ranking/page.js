"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import GoldenCheckmark from "@/components/GoldenCheckmark";
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

const tokensData = [
  {
    id: 1,
    ticker: "$SOL",
    name: "Solana",
    creator: "solana",
    creatorName: "Solana",
    price: "$178.42",
    priceChange24h: 12.5,
    priceChange7d: 28.3,
    marketCap: "$54.42M",
    volume24h: "$49.43M",
    holders: "125K",
    verified: true,
    trending: true,
    chartData: [40, 45, 42, 48, 52, 58, 65, 62, 70, 75, 78, 82],
  },
  {
    id: 2,
    ticker: "$VSOL",
    name: "VanEck SOL",
    creator: "vaneck_us",
    creatorName: "VanEck",
    price: "$23.11",
    priceChange24h: 8.2,
    priceChange7d: 15.6,
    marketCap: "$23.11M",
    volume24h: "$5.98M",
    holders: "45K",
    verified: true,
    trending: true,
    chartData: [30, 32, 35, 38, 36, 42, 45, 48, 52, 55, 58, 60],
  },
  {
    id: 3,
    ticker: "$TOLY",
    name: "Toly Token",
    creator: "aeyakovenko",
    creatorName: "Anatoly Yakovenko",
    price: "$6.44",
    priceChange24h: -2.3,
    priceChange7d: 5.8,
    marketCap: "$7.24M",
    volume24h: "$1.24M",
    holders: "32K",
    verified: true,
    trending: false,
    chartData: [50, 52, 48, 45, 47, 44, 42, 45, 43, 46, 44, 42],
  },
  {
    id: 4,
    ticker: "$LILY",
    name: "Lily Token",
    creator: "calilyliu",
    creatorName: "Lily Liu",
    price: "$2.27",
    priceChange24h: 15.7,
    priceChange7d: 42.3,
    marketCap: "$1.95M",
    volume24h: "$450K",
    holders: "18K",
    verified: true,
    trending: true,
    chartData: [20, 22, 25, 28, 32, 38, 42, 48, 55, 62, 68, 75],
  },
  {
    id: 5,
    ticker: "$MABLE",
    name: "Mable Token",
    creator: "Mable_Jiang",
    creatorName: "Mable Jiang",
    price: "$0.83",
    priceChange24h: 5.4,
    priceChange7d: 12.1,
    marketCap: "$829K",
    volume24h: "$120K",
    holders: "8.5K",
    verified: true,
    trending: false,
    chartData: [35, 38, 40, 42, 45, 48, 46, 50, 52, 55, 58, 60],
  },
  {
    id: 6,
    ticker: "$CRYPT",
    name: "Crypto Daily",
    creator: "cryptodaily",
    creatorName: "Crypto Daily",
    price: "$0.42",
    priceChange24h: -1.2,
    priceChange7d: -5.4,
    marketCap: "$420K",
    volume24h: "$85K",
    holders: "5.2K",
    verified: true,
    trending: false,
    chartData: [45, 43, 42, 40, 42, 38, 36, 38, 35, 37, 34, 32],
  },
  {
    id: 7,
    ticker: "$SPARK",
    name: "Sparks Token",
    creator: "sparksclub",
    creatorName: "Sparks Club",
    price: "$1.24",
    priceChange24h: 25.8,
    priceChange7d: 85.2,
    marketCap: "$2.48M",
    volume24h: "$680K",
    holders: "12K",
    verified: true,
    trending: true,
    chartData: [15, 18, 22, 28, 35, 42, 55, 65, 72, 80, 88, 95],
  },
  {
    id: 8,
    ticker: "$DEFI",
    name: "DeFi Token",
    creator: "defiking",
    creatorName: "DeFi King",
    price: "$3.56",
    priceChange24h: 3.2,
    priceChange7d: 8.7,
    marketCap: "$890K",
    volume24h: "$95K",
    holders: "6.8K",
    verified: false,
    trending: false,
    chartData: [40, 42, 45, 43, 46, 48, 50, 52, 54, 53, 55, 58],
  },
];

function MiniChart({ data, isPositive }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${isPositive ? "up" : "down"}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${isPositive ? "up" : "down"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TokenRow({ token, rank }) {
  const isTop3 = rank <= 3;
  const rankColors = {
    1: "from-yellow-400 to-amber-600",
    2: "from-gray-300 to-gray-500",
    3: "from-amber-600 to-amber-800",
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all">
      {/* Rank */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          isTop3
            ? `bg-gradient-to-br ${rankColors[rank]} text-black`
            : "bg-white/10 text-white/70"
        }`}
      >
        {rank}
      </div>

      {/* Token Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4ed31]/30 to-purple-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{token.ticker.replace("$", "").slice(0, 2)}</span>
          </div>
          {token.trending && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 7.5a1 1 0 0 0-2 0v2a1 1 0 0 0 .4.8l1.5 1a1 1 0 0 0 1.1-1.6l-1-1V7.5zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#d4ed31]">{token.ticker}</span>
            <span className="text-white font-medium truncate">{token.name}</span>
            {token.verified && <GoldenCheckmark size={14} />}
          </div>
          <Link
            href={`/creator/${token.creator}`}
            className="text-sm text-white/50 hover:text-[#d4ed31] transition"
          >
            by @{token.creator}
          </Link>
        </div>
      </div>

      {/* Chart */}
      <div className="hidden sm:block flex-shrink-0">
        <MiniChart data={token.chartData} isPositive={token.priceChange7d >= 0} />
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0 w-24">
        <p className="font-semibold text-white">{token.price}</p>
        <p
          className={`text-sm ${
            token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {token.priceChange24h >= 0 ? "+" : ""}
          {token.priceChange24h}%
        </p>
      </div>

      {/* Market Cap */}
      <div className="hidden md:block text-right flex-shrink-0 w-24">
        <p className="text-sm text-white/50">MCap</p>
        <p className="font-medium text-white">{token.marketCap}</p>
      </div>

      {/* Volume */}
      <div className="hidden lg:block text-right flex-shrink-0 w-24">
        <p className="text-sm text-white/50">24h Vol</p>
        <p className="font-medium text-white">{token.volume24h}</p>
      </div>

      {/* Action */}
      <Link
        href={`/creator/${token.creator}`}
        className="px-4 py-2 rounded-xl bg-[#d4ed31] text-[#050207] text-sm font-semibold hover:bg-[#eaff5f] transition opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        Trade
      </Link>
    </div>
  );
}

function TopTokenCard({ token }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d4ed31]/30 bg-gradient-to-br from-[#d4ed31]/10 via-transparent to-purple-500/10 p-5">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4ed31]/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4ed31]/40 to-purple-500/40 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{token.ticker.replace("$", "").slice(0, 2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#d4ed31]">{token.ticker}</span>
                {token.verified && <GoldenCheckmark size={14} />}
              </div>
              <p className="text-sm text-white/50">{token.name}</p>
            </div>
          </div>
          {token.trending && (
            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 7.5a1 1 0 0 0-2 0v2a1 1 0 0 0 .4.8l1.5 1a1 1 0 0 0 1.1-1.6l-1-1V7.5z" />
              </svg>
              Hot
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{token.price}</p>
            <p
              className={`text-sm font-medium ${
                token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {token.priceChange24h >= 0 ? "+" : ""}
              {token.priceChange24h}% (24h)
            </p>
          </div>
          <MiniChart data={token.chartData} isPositive={token.priceChange7d >= 0} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2 rounded-lg bg-black/20 text-center">
            <p className="text-[10px] text-white/50">MCap</p>
            <p className="text-xs font-semibold text-white">{token.marketCap}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/20 text-center">
            <p className="text-[10px] text-white/50">Volume</p>
            <p className="text-xs font-semibold text-white">{token.volume24h}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/20 text-center">
            <p className="text-[10px] text-white/50">Holders</p>
            <p className="text-xs font-semibold text-white">{token.holders}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrendingTokensPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeframe, setTimeframe] = useState("24h");
  const [sortBy, setSortBy] = useState("trending");

  // Sort tokens based on selection
  const sortedTokens = [...tokensData].sort((a, b) => {
    if (sortBy === "trending") {
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return b.priceChange24h - a.priceChange24h;
    }
    if (sortBy === "gainers") {
      return b.priceChange24h - a.priceChange24h;
    }
    if (sortBy === "volume") {
      return parseFloat(b.volume24h.replace(/[$,KM]/g, "")) - parseFloat(a.volume24h.replace(/[$,KM]/g, ""));
    }
    return 0;
  });

  const topTokens = sortedTokens.slice(0, 3);
  const otherTokens = sortedTokens.slice(3);

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

          <div className="flex flex-1 flex-col gap-4 min-h-0 h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  <span className="text-[#d4ed31]">Trending</span> Tokens
                </h1>
                <p className="text-white/50 mt-1">Discover the hottest creator tokens on Sparks</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Timeframe */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                  {["24h", "7d", "30d"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        timeframe === t
                          ? "bg-[#d4ed31] text-[#050207]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Tabs */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {[
                { id: "trending", label: "Trending", icon: "fire" },
                { id: "gainers", label: "Top Gainers", icon: "up" },
                { id: "volume", label: "Volume", icon: "chart" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    sortBy === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon === "fire" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.04-6.58 5-8.04V4c0-.55.45-1 1-1s1 .45 1 1v2.02c.5-.13 1-.19 1.5-.19.53 0 1.05.08 1.55.22V4c0-.55.45-1 1-1s1 .45 1 1v2.42c2.61 1.67 4.5 4.47 4.94 7.75.01.08.02.16.02.24.03.2.04.39.04.59 0 4.97-4.03 9-9 9z" />
                    </svg>
                  )}
                  {tab.icon === "up" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {tab.icon === "chart" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              {/* Top 3 Tokens Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {topTokens.map((token, index) => (
                  <div key={token.id} className="relative">
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center z-10 font-bold text-sm text-black">
                      #{index + 1}
                    </div>
                    <TopTokenCard token={token} />
                  </div>
                ))}
              </div>

              {/* Token List */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icons.TrendingUp size={20} className="text-[#d4ed31]" />
                  All Tokens
                </h2>
                {otherTokens.map((token, index) => (
                  <TokenRow key={token.id} token={token} rank={index + 4} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
