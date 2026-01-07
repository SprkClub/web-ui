"use client";

import { useState } from "react";
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

// Sample live streams data
const liveStreams = [
  {
    id: 1,
    creator: {
      name: "Solana",
      username: "solana",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$SOL",
    },
    title: "Building the Future of DeFi - Live AMA",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop",
    viewers: 12500,
    startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: "Crypto Talk",
  },
  {
    id: 2,
    creator: {
      name: "VanEck",
      username: "vaneck_us",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$VSOL",
    },
    title: "Institutional Crypto Investing - Q&A Session",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
    viewers: 8420,
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: "Finance",
  },
  {
    id: 3,
    creator: {
      name: "Crypto Daily",
      username: "cryptodaily",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$CRYPT",
    },
    title: "Market Analysis: What's Next for Altcoins?",
    thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop",
    viewers: 5890,
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: "Trading",
  },
  {
    id: 4,
    creator: {
      name: "NFT Insider",
      username: "nftinsider",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$NFT",
    },
    title: "Live NFT Minting Event - Exclusive Drop",
    thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&h=450&fit=crop",
    viewers: 3420,
    startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    category: "NFTs",
  },
  {
    id: 5,
    creator: {
      name: "DeFi Alpha",
      username: "defialpha",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$ALPHA",
    },
    title: "Yield Farming Strategies for 2025",
    thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop",
    viewers: 2150,
    startedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    category: "DeFi",
  },
  {
    id: 6,
    creator: {
      name: "Web3 Dev",
      username: "web3dev",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$W3D",
    },
    title: "Building on Solana - Live Coding Session",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
    viewers: 1820,
    startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    category: "Development",
  },
];

const categories = ["All", "Crypto Talk", "Trading", "DeFi", "NFTs", "Development", "Finance"];

function formatViewers(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDuration(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const minutes = Math.floor((now - date) / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function LiveStreamCard({ stream }) {
  return (
    <Link
      href={`/creator/${stream.creator.username}`}
      className="group block"
    >
      <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition">
        {/* Thumbnail */}
        <div className="relative aspect-video">
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {/* Live Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
              {formatDuration(stream.startedAt)}
            </span>
          </div>
          {/* Viewers */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            {formatViewers(stream.viewers)} watching
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex gap-3">
            {/* Creator Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#d4ed31]/20 flex items-center justify-center flex-shrink-0">
              {stream.creator.profileImage ? (
                <img src={stream.creator.profileImage} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-sm font-bold text-[#d4ed31]">
                  {stream.creator.name.charAt(0)}
                </span>
              )}
            </div>
            {/* Stream Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#d4ed31] transition">
                {stream.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-white/60 text-xs">{stream.creator.name}</span>
                {stream.creator.isCreator && <GoldenCheckmark size={12} />}
                {stream.creator.tokenTicker && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-[#d4ed31]/20 text-[#d4ed31] rounded font-medium">
                    {stream.creator.tokenTicker}
                  </span>
                )}
              </div>
              <span className="text-white/40 text-xs">{stream.category}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LivePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredStreams = selectedCategory === "All"
    ? liveStreams
    : liveStreams.filter(stream => stream.category === selectedCategory);

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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full">
          <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Live Now</h1>
                  <p className="text-white/50 text-sm">{liveStreams.length} creators streaming</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 flex-shrink-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? "bg-[#d4ed31] text-[#050207]"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Live Streams Grid */}
            {filteredStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStreams.map((stream) => (
                  <LiveStreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Icons.Live size={32} className="text-white/30" />
                  </div>
                  <p className="text-white/50">No live streams in this category</p>
                  <p className="text-white/30 text-sm mt-1">Check back later for more streams</p>
                </div>
              </div>
            )}

            {/* Coming Soon Section */}
            <div className="mt-6 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white mb-4">Coming Soon</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-1">Start Your Own Stream</h3>
                <p className="text-white/50 text-sm">
                  Verified creators will soon be able to go live and connect with their audience in real-time.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
