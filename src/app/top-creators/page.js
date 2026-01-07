"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import { Icons } from "@/lib/icons";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

// Sample creators data - in production, this would come from an API
const creatorsData = [
  {
    id: 1,
    name: "Solana",
    handle: "solana",
    bio: "The fastest blockchain in the world. Building the future of decentralized finance.",
    tokenTicker: "$SOL",
    tokenPrice: 178.42,
    priceChange: 12.5,
    marketCap: 54420000,
    volume24h: 49430000,
    followers: 125000,
    subscribers: 8420,
    posts: 342,
    avatar: null,
    verified: true,
    category: "Blockchain",
  },
  {
    id: 2,
    name: "VanEck",
    handle: "vaneck_us",
    bio: "Global investment manager focused on innovative investment strategies.",
    tokenTicker: "$VSOL",
    tokenPrice: 23.11,
    priceChange: 8.2,
    marketCap: 23110000,
    volume24h: 5980000,
    followers: 45000,
    subscribers: 3200,
    posts: 128,
    avatar: null,
    verified: true,
    category: "Finance",
  },
  {
    id: 3,
    name: "Anatoly Yakovenko",
    handle: "aeyakovenko",
    bio: "Co-founder of Solana Labs. Building high-performance blockchain infrastructure.",
    tokenTicker: "$TOLY",
    tokenPrice: 6.44,
    priceChange: -2.3,
    marketCap: 7240000,
    volume24h: 1240000,
    followers: 653000,
    subscribers: 12800,
    posts: 567,
    avatar: null,
    verified: true,
    category: "Tech",
  },
  {
    id: 4,
    name: "Lily Liu",
    handle: "calilyliu",
    bio: "President of Solana Foundation. Driving adoption and ecosystem growth.",
    tokenTicker: "$LILY",
    tokenPrice: 2.27,
    priceChange: 15.7,
    marketCap: 1950000,
    volume24h: 450000,
    followers: 50000,
    subscribers: 2100,
    posts: 89,
    avatar: null,
    verified: true,
    category: "Leadership",
  },
  {
    id: 5,
    name: "Mable Jiang",
    handle: "Mable_Jiang",
    bio: "Building the future of DeFi. Investor and advisor to top crypto projects.",
    tokenTicker: "$MABLE",
    tokenPrice: 0.83,
    priceChange: 5.4,
    marketCap: 829000,
    volume24h: 120000,
    followers: 48000,
    subscribers: 1580,
    posts: 234,
    avatar: null,
    verified: true,
    category: "DeFi",
  },
  {
    id: 6,
    name: "Crypto Daily",
    handle: "cryptodaily",
    bio: "Your daily dose of crypto news, analysis, and alpha.",
    tokenTicker: "$CRYPT",
    tokenPrice: 0.42,
    priceChange: -1.2,
    marketCap: 420000,
    volume24h: 85000,
    followers: 28000,
    subscribers: 890,
    posts: 1245,
    avatar: null,
    verified: true,
    category: "Media",
  },
  {
    id: 7,
    name: "DeFi Wizard",
    handle: "defiwizard",
    bio: "Uncovering yield opportunities across the DeFi landscape.",
    tokenTicker: "$WIZZ",
    tokenPrice: 1.15,
    priceChange: 22.4,
    marketCap: 1150000,
    volume24h: 340000,
    followers: 67000,
    subscribers: 4200,
    posts: 456,
    avatar: null,
    verified: true,
    category: "DeFi",
  },
  {
    id: 8,
    name: "NFT Alpha",
    handle: "nftalpha",
    bio: "Curating the best NFT drops and collections on Solana.",
    tokenTicker: "$ALPHA",
    tokenPrice: 0.67,
    priceChange: 8.9,
    marketCap: 670000,
    volume24h: 180000,
    followers: 34000,
    subscribers: 1200,
    posts: 678,
    avatar: null,
    verified: true,
    category: "NFT",
  },
];

function formatNumber(num) {
  if (typeof num === "string") return num;
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatPrice(num) {
  if (num >= 1) return "$" + num.toFixed(2);
  return "$" + num.toFixed(4);
}

// Podium for top 3 creators
function TopThreePodium({ creators }) {
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ["h-28", "h-36", "h-24"];
  const sizes = ["w-16 h-16", "w-20 h-20", "w-14 h-14"];
  const medals = [
    { bg: "from-gray-300 to-gray-400", icon: "2" },
    { bg: "from-yellow-400 to-amber-500", icon: "1" },
    { bg: "from-amber-600 to-amber-700", icon: "3" },
  ];

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {podiumOrder.map((index, position) => {
        const creator = creators[index];
        if (!creator) return null;

        return (
          <Link
            key={creator.id}
            href={`/creator/${creator.handle}`}
            className="group flex flex-col items-center"
          >
            {/* Avatar */}
            <div className="relative mb-3">
              <div
                className={`${sizes[position]} rounded-full bg-gradient-to-br from-[#d4ed31]/40 to-purple-500/40 flex items-center justify-center overflow-hidden ring-2 ring-white/20 group-hover:ring-[#d4ed31]/50 transition`}
              >
                {creator.avatar ? (
                  <img src={creator.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{creator.name.charAt(0)}</span>
                )}
              </div>
              {/* Medal */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${medals[position].bg} flex items-center justify-center text-xs font-bold text-black shadow-lg`}
              >
                {medals[position].icon}
              </div>
              {creator.verified && (
                <div className="absolute -top-1 -right-1">
                  <GoldenCheckmark size={14} />
                </div>
              )}
            </div>

            {/* Name */}
            <p className="text-sm font-semibold text-white text-center mb-1 group-hover:text-[#d4ed31] transition">
              {creator.name}
            </p>
            <p className="text-xs text-white/50">@{creator.handle}</p>

            {/* Token Info */}
            <div className="mt-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs font-medium text-[#d4ed31]">{creator.tokenTicker}</span>
              <span className={`text-xs ml-1 ${creator.priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {creator.priceChange >= 0 ? "+" : ""}{creator.priceChange}%
              </span>
            </div>

            {/* Podium */}
            <div
              className={`${heights[position]} w-24 mt-4 rounded-t-xl bg-gradient-to-b ${
                position === 1
                  ? "from-[#d4ed31]/30 to-[#d4ed31]/10 border-t-2 border-x-2 border-[#d4ed31]/50"
                  : "from-white/10 to-white/5 border-t border-x border-white/10"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}

// Creator row for leaderboard
function CreatorRow({ creator, rank }) {
  const isPositive = creator.priceChange >= 0;

  return (
    <Link
      href={`/creator/${creator.handle}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
    >
      {/* Rank */}
      <div className="w-8 text-center">
        <span className="text-lg font-bold text-white/40">#{rank}</span>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4ed31]/30 to-purple-500/30 flex items-center justify-center overflow-hidden">
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{creator.name.charAt(0)}</span>
            )}
          </div>
          {creator.verified && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <GoldenCheckmark size={14} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate group-hover:text-[#d4ed31] transition">
            {creator.name}
          </p>
          <p className="text-sm text-white/50 truncate">@{creator.handle}</p>
        </div>
      </div>

      {/* Category Badge */}
      <div className="hidden sm:block">
        <span className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60 border border-white/10">
          {creator.category}
        </span>
      </div>

      {/* Token */}
      <div className="hidden md:flex items-center gap-2 min-w-[120px]">
        <span className="text-sm font-semibold text-[#d4ed31]">{creator.tokenTicker}</span>
        <span className="text-sm text-white">{formatPrice(creator.tokenPrice)}</span>
      </div>

      {/* Change */}
      <div className="min-w-[70px] text-right">
        <span className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}{creator.priceChange}%
        </span>
      </div>

      {/* Market Cap */}
      <div className="hidden lg:block min-w-[90px] text-right">
        <p className="text-sm font-medium text-white">${formatNumber(creator.marketCap)}</p>
        <p className="text-xs text-white/40">Market Cap</p>
      </div>

      {/* Followers */}
      <div className="hidden xl:block min-w-[80px] text-right">
        <p className="text-sm font-medium text-white">{formatNumber(creator.followers)}</p>
        <p className="text-xs text-white/40">Followers</p>
      </div>

      {/* Arrow */}
      <div className="w-6">
        <Icons.ArrowRight size={16} className="text-white/30 group-hover:text-[#d4ed31] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

// Stats card
function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-white/30" />}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? "+" : ""}{trend}% from last week
        </p>
      )}
    </div>
  );
}

export default function TopCreatorsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState("marketCap");
  const [timeframe, setTimeframe] = useState("24h");

  // Sort creators
  const sortedCreators = [...creatorsData]
    .sort((a, b) => {
      if (sortBy === "marketCap") return b.marketCap - a.marketCap;
      if (sortBy === "priceChange") return b.priceChange - a.priceChange;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "volume") return b.volume24h - a.volume24h;
      return 0;
    });

  const topThree = sortedCreators.slice(0, 3);
  const restCreators = sortedCreators.slice(3);

  // Calculate totals for stats
  const totalMarketCap = creatorsData.reduce((sum, c) => sum + c.marketCap, 0);
  const totalVolume = creatorsData.reduce((sum, c) => sum + c.volume24h, 0);
  const totalFollowers = creatorsData.reduce((sum, c) => sum + c.followers, 0);

  return (
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-20 w-80 h-80 rounded-full bg-[#d4ed31]/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div className="flex flex-1 flex-col gap-5 min-h-0 h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4ed31] to-[#a8c429] flex items-center justify-center">
                    <Icons.Medal size={20} className="text-black" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Top Creators
                    </h1>
                    <p className="text-sm text-white/50">
                      The most influential creators on Sparks
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                {["24h", "7d", "30d", "All"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      timeframe === t
                        ? "bg-[#d4ed31] text-[#050207]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              <StatCard
                label="Total Creators"
                value={creatorsData.length}
                icon={Icons.User}
              />
              <StatCard
                label="Total Market Cap"
                value={"$" + formatNumber(totalMarketCap)}
                icon={Icons.TrendingUp}
                trend={8.5}
              />
              <StatCard
                label="24h Volume"
                value={"$" + formatNumber(totalVolume)}
                icon={Icons.TrendingUp}
                trend={12.3}
              />
              <StatCard
                label="Total Followers"
                value={formatNumber(totalFollowers)}
                icon={Icons.Heart}
                trend={5.2}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/40">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#d4ed31]/50 cursor-pointer"
              >
                <option value="marketCap">Market Cap</option>
                <option value="priceChange">Price Change</option>
                <option value="followers">Followers</option>
                <option value="volume">24h Volume</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
            {/* Top 3 Podium */}
            <div className="mb-6">
              <TopThreePodium creators={topThree} />
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wide">
                  Leaderboard
                </h2>
                <span className="text-xs text-white/30">
                  {sortedCreators.length} creators
                </span>
              </div>

              <div className="space-y-2">
                {restCreators.map((creator, index) => (
                  <CreatorRow key={creator.id} creator={creator} rank={index + 4} />
                ))}
              </div>

              {restCreators.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Icons.User size={24} className="text-white/30" />
                  </div>
                  <p className="text-white/50">No creators found</p>
                  <p className="text-sm text-white/30 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
