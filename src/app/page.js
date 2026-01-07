"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import CreatePostModal from "@/components/CreatePostModal";
import TrendsRanking from "@/components/TrendsRanking";
import TopCreators from "@/components/TopCreators";
import StatsGrid from "@/components/StatsGrid";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

// Admin usernames
const ADMIN_USERNAMES = ["iathulnambiar"];

// Sample posts data with market cap and token ticker
const samplePosts = [
  {
    id: 1,
    author: {
      id: "creator-solana",
      name: "Solana",
      username: "solana",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$SOL",
    },
    content: "BREAKING: $VSOL from @vaneck_us is live, a new Solana staking ETF. This is a major milestone for institutional adoption of Solana.",
    image: null,
    impressions: 12500,
    superLikes: 342,
    marketCap: "$54.2M",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 2,
    author: {
      id: "creator-vaneck",
      name: "VanEck",
      username: "vaneck_us",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$VSOL",
    },
    content: "Institutional staking now has a liquid wrapper. $VSOL leads the charge into a new era of DeFi accessibility.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    impressions: 8900,
    superLikes: 156,
    marketCap: "$12.8M",
    createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
  },
  {
    id: 3,
    author: {
      id: "creator-cryptodaily",
      name: "Crypto Daily",
      username: "cryptodaily",
      profileImage: null,
      isCreator: true,
      tokenTicker: "$CRYPT",
    },
    content: "The future of finance is being built on Solana. Fast, cheap, and scalable. What more could you ask for?",
    image: null,
    impressions: 5400,
    superLikes: 89,
    marketCap: "$8.5M",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 4,
    author: {
      id: "user-defiwhale",
      name: "DeFi Whale",
      username: "defiwhale",
      profileImage: null,
      isCreator: false,
      tokenTicker: null,
    },
    content: "Just aped into the new Solana ecosystem tokens. The momentum is insane right now. Who else is bullish?",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop",
    impressions: 3200,
    superLikes: 67,
    marketCap: "$2.1M",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const rankings = [
  { symbol: "$SOL", value: "$54.42K" },
  { symbol: "$VSOL", value: "$23.11K" },
  { symbol: "$PENNY", value: "$17.65K" },
  { symbol: "$CYPHERPUNK", value: "$10.56K" },
  { symbol: "$DEPIN", value: "$9.47K" },
];

const creators = [
  { name: "muper", handle: "@easytopredict", rewards: "$63.72K" },
  { name: "Zack Graham", handle: "@oftpm52944791", rewards: "$8.05K" },
  { name: "toly", handle: "@aeyakovenco", rewards: "$6.75K" },
];

const statsCards = [
  { label: "TPS", value: "2047", detail: "+12% live" },
  { label: "Active", value: "18.4K", detail: "traders now" },
];

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// TimeAgo component to avoid hydration mismatch
function TimeAgo({ dateString }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    setTimeAgo(formatTimeAgo(dateString));
    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(dateString));
    }, 60000);
    return () => clearInterval(interval);
  }, [dateString]);

  return <span>{timeAgo}</span>;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function PostCard({ post, isAuthenticated, onAuthRequired }) {
  const [liked, setLiked] = useState(false);
  const [superLikes, setSuperLikes] = useState(post.superLikes);

  const handleSuperLike = (e) => {
    e.stopPropagation();

    // Show auth popup if not authenticated
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (!liked) {
      setSuperLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  const authorLink = post.author.isCreator
    ? `/creator/${post.author.username}`
    : `/user/${post.author.username}`;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition">
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={authorLink} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#d4ed31]/50 transition">
            {post.author.profileImage ? (
              <img src={post.author.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold text-[#d4ed31]">
                {post.author.name.charAt(0)}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={authorLink} className="flex items-center gap-1.5 group">
              <span className="font-semibold text-white text-sm group-hover:text-[#d4ed31] transition">{post.author.name}</span>
              {post.author.isCreator && <GoldenCheckmark size={16} />}
            </Link>
            {post.author.tokenTicker && (
              <span className="px-1.5 py-0.5 text-[10px] bg-[#d4ed31]/20 text-[#d4ed31] rounded font-medium">
                {post.author.tokenTicker}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Link href={authorLink} className="hover:text-[#d4ed31] transition">
              @{post.author.username}
            </Link>
            <span>·</span>
            <TimeAgo dateString={post.createdAt} />
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-white/90 text-sm leading-relaxed mb-3">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={post.image} alt="" className="w-full h-auto max-h-72 object-cover" />
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Impressions */}
          <div className="flex items-center gap-1.5 text-white/50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs">{formatNumber(post.impressions)}</span>
          </div>

          {/* Market Cap */}
          {post.marketCap && (
            <div className="flex items-center gap-1.5 text-white/50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">{post.marketCap}</span>
            </div>
          )}
        </div>

        {/* Super Like Button */}
        <button
          onClick={handleSuperLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition text-xs ${
            liked
              ? "bg-[#d4ed31]/20 text-[#d4ed31]"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="font-medium">{formatNumber(superLikes)}</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [posts, setPosts] = useState(samplePosts);
  const { ready, isAuthenticated, username, displayName, profileImage, isCreator, login } = usePrivyAuth();

  // Check if user can create posts (creator or admin)
  const isAdmin = username && ADMIN_USERNAMES.includes(username.toLowerCase());
  const canCreatePost = ready && isAuthenticated && (isAdmin || isCreator);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setShowAuthModal(false);
    login();
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      {/* Background orbs */}
      <div className="orb absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#d4ed31]/50 hidden lg:block" />
      <div className="orb absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#4c5259] hidden lg:block" />

      {/* Main container - centered with max-width */}
      <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Content area - centered */}
        <div className="flex flex-1 flex-col lg:flex-row gap-4 lg:gap-5 min-h-0 h-full justify-center">
          {/* Main Feed - reduced width */}
          <div className="flex flex-col gap-4 w-full max-w-lg lg:max-w-xl min-h-0 h-full order-2 lg:order-1">
            <main className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto pb-6 min-h-0 h-full">
              {/* Create Post Card - Only for creators/admin */}
              {canCreatePost && (
                <div
                  className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 cursor-pointer hover:bg-white/[0.07] transition"
                  onClick={() => setIsPostModalOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profileImage ? (
                        <img src={profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icons.User size={18} className="text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 px-3 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm">
                      What's on your mind?
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition text-white/60 text-sm">
                      <Icons.Image size={18} className="text-green-400" />
                      <span>Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Posts Feed */}
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            </main>
          </div>

          {/* Right Sidebar - hidden on mobile, shown on tablet+ */}
          <section className="hidden md:flex no-scrollbar w-full md:w-64 lg:w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto pb-6 min-h-0 h-full order-1 lg:order-2">
            <TrendsRanking rankings={rankings} />
            <TopCreators creators={creators} />
            <StatsGrid stats={statsCards} />
          </section>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4ed31]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sign in to like</h3>
            <p className="text-white/60 text-sm mb-6">Connect with X to like posts and interact with the community.</p>
            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Sign in with X
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
