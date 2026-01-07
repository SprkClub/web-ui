"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import WalletConnectButton from "@/components/WalletConnectButton";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useWallets } from "@privy-io/react-auth";

// Sample chart data for token price (kept for visual display until token data is implemented)
const generateChartData = (days = 30) => {
  const data = [];
  let price = Math.random() * 50 + 10;
  for (let i = 0; i < days; i++) {
    price = price + (Math.random() - 0.45) * 5;
    if (price < 1) price = 1;
    data.push({
      day: i,
      price: price,
      volume: Math.random() * 1000000 + 100000,
    });
  }
  return data;
};

function TokenChart({ ticker, marketCap }) {
  const [chartData] = useState(() => generateChartData(30));
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - ((d.price - minPrice) / priceRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  const lastPrice = chartData[chartData.length - 1].price;
  const firstPrice = chartData[0].price;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4ed31]/20 flex items-center justify-center">
            <span className="text-sm font-bold text-[#d4ed31]">{ticker?.replace('$', '')}</span>
          </div>
          <div>
            <p className="font-semibold text-white">{ticker}</p>
            <p className="text-xs text-white/50">Creator Token</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[#d4ed31]">{marketCap}</p>
          <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}% (30d)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-32 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const index = Math.min(Math.floor(x * chartData.length), chartData.length - 1);
            setHoveredPoint(chartData[index]);
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {/* Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 text-xs">
            <p className="text-white font-semibold">${hoveredPoint.price.toFixed(4)}</p>
            <p className="text-white/50">Vol: ${(hoveredPoint.volume / 1000).toFixed(1)}K</p>
          </div>
        )}
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-2 text-[10px] text-white/40">
        <span>30d ago</span>
        <span>15d ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
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

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function PostCard({ post, creator }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = () => {
    if (!liked) {
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    } else {
      setLikesCount((prev) => Math.max(0, prev - 1));
      setLiked(false);
    }
  };

  // Get the first media URL if available
  const postImage = post.mediaUrls?.[0] || post.image;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition">
      {/* Author - compact since we're on their profile */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-sm">{creator.name}</span>
          <GoldenCheckmark size={14} />
        </div>
        <span className="text-xs text-white/40">·</span>
        <span className="text-xs text-white/50">{formatTimeAgo(post.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-white/90 text-sm leading-relaxed mb-3">{post.content}</p>

      {/* Image */}
      {postImage && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={postImage} alt="" className="w-full h-auto max-h-72 object-cover" />
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-4">
          {/* Likes count display */}
          <div className="flex items-center gap-1.5 text-white/50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs">{formatNumber(likesCount)} likes</span>
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition text-xs ${
            liked
              ? "bg-red-500/20 text-red-400"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium">{liked ? "Liked" : "Like"}</span>
        </button>
      </div>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard({
  plan,
  isSubscribed,
  subscription,
  walletAddress,
  isAuthenticated,
  onSubscribe,
  isLoading,
  isOwnProfile,
}) {
  if (!plan) return null;

  const isFree = plan.price === 0;

  return (
    <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-[#d4ed31]/10 via-transparent to-purple-500/10 border border-[#d4ed31]/30">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <h3 className="font-semibold text-white">Exclusive Access</h3>
        {isFree && (
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            FREE
          </span>
        )}
      </div>

      <h4 className="text-lg font-bold text-white mb-2">{plan.title}</h4>
      <p className="text-sm text-white/60 mb-4">{plan.description}</p>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs text-white/50">Price</p>
          <p className="text-xl font-bold text-[#d4ed31]">
            {isFree ? "FREE" : `${plan.price} SOL`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Duration</p>
          <p className="text-sm font-medium text-white">1 Month</p>
        </div>
      </div>

      {isOwnProfile ? (
        <Link
          href="/creator/dashboard"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Plan
        </Link>
      ) : isSubscribed ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Subscribed</span>
          </div>
          {subscription && (
            <p className="text-center text-xs text-white/50">
              Expires {new Date(subscription.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : !isAuthenticated ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-white/50">Login to subscribe</p>
          <WalletConnectButton variant="primary" size="lg" className="w-full" />
        </div>
      ) : !walletAddress ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-white/50">Connect wallet to subscribe</p>
          <WalletConnectButton variant="primary" size="lg" className="w-full" />
        </div>
      ) : (
        <button
          onClick={onSubscribe}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#050207] border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : isFree ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Get Free Access
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Subscribe for {plan.price} SOL
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [tempCoverImage, setTempCoverImage] = useState(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const { isAuthenticated, username: currentUsername } = usePrivyAuth();
  const { wallets } = useWallets();

  // Creator data state
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscription state
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscribingLoading, setSubscribingLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const primaryWallet = wallets?.[0];
  const walletAddress = primaryWallet?.address;

  // Check if this is the current user's profile
  const isOwnProfile = isAuthenticated && currentUsername === username;

  // Fetch creator data
  const fetchCreatorData = useCallback(async () => {
    if (!username) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/creators/username/${username}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Creator not found");
        } else {
          setError("Failed to load creator profile");
        }
        setCreator(null);
        return;
      }

      const data = await res.json();
      setCreator(data.creator);
      setPosts(data.posts || []);
      setStats(data.stats || { totalPosts: 0, totalLikes: 0 });
      setIsFollowing(data.isFollowing || false);
    } catch (err) {
      console.error("Error fetching creator data:", err);
      setError("Failed to load creator profile");
      setCreator(null);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  // Fetch subscription plan for this creator
  const fetchSubscriptionPlan = useCallback(async () => {
    if (!username) return;

    try {
      const res = await fetch(`/api/creator/subscription/${username}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionPlan(data.plan);
        setIsSubscribed(data.isSubscribed);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
    }
  }, [username]);

  useEffect(() => {
    fetchCreatorData();
    fetchSubscriptionPlan();
  }, [fetchCreatorData, fetchSubscriptionPlan]);

  async function handleSubscribe() {
    if (!subscriptionPlan || !walletAddress) return;

    setSubscribingLoading(true);
    try {
      // For paid subscriptions, we would integrate with Solana here
      // For now, we'll just record the subscription (simulating payment)
      const res = await fetch("/api/subscriptions/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: subscriptionPlan.id,
          walletAddress: walletAddress,
          transactionHash: subscriptionPlan.price === 0 ? null : "simulated-tx-" + Date.now(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubscribed(true);
        setSubscription(data.subscription);
        setAlert({ type: "success", message: "Successfully subscribed!" });
      } else {
        setAlert({ type: "error", message: data.error || "Failed to subscribe" });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setAlert({ type: "error", message: "Failed to subscribe" });
    } finally {
      setSubscribingLoading(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#d4ed31] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/50">Loading creator profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !creator) {
    return (
      <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <Icons.User size={40} className="text-white/30" />
            </div>
            <h1 className="text-2xl font-bold">Creator Not Found</h1>
            <p className="text-white/50">The creator @{username} doesn't exist or is not an approved creator.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get display values from API data
  const creatorName = creator.displayName || creator.twitterName || creator.username || username;
  const creatorUsername = creator.twitterUsername || creator.username || username;
  const creatorBio = creator.bio || "";
  const creatorProfileImage = creator.profileImage;
  const creatorFollowers = creator.followers || 0;
  const creatorFollowing = creator.following || 0;

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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-3xl mx-auto">
          <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Alert */}
            {alert && (
              <div
                className={`mx-4 p-4 rounded-xl flex items-center justify-between ${
                  alert.type === "success"
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-red-500/20 border border-red-500/30 text-red-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {alert.type === "success" ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <button
                  onClick={() => setAlert(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Cover Image */}
            <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-[#d4ed31]/20 to-purple-500/20 flex-shrink-0 group">
              {tempCoverImage ? (
                <img src={tempCoverImage} alt="" className="w-full h-full object-cover" />
              ) : creator.coverImage ? (
                <img src={creator.coverImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#d4ed31]/30 via-purple-500/30 to-pink-500/30" />
              )}
              {/* Back Button */}
              <Link
                href="/"
                className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              {/* Edit Cover Button - Only show for own profile */}
              {isOwnProfile && (
                <>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setTempCoverImage(url);
                        setIsEditingProfile(true);
                      }
                    }}
                  />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="relative px-4 -mt-12 flex-shrink-0">
              {/* Avatar */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 group">
                <div className="w-full h-full rounded-full bg-[#050207] p-1">
                  <div className="w-full h-full rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
                    {tempProfileImage ? (
                      <img src={tempProfileImage} alt="" className="w-full h-full object-cover" />
                    ) : creatorProfileImage ? (
                      <img src={creatorProfileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-[#d4ed31]">
                        {creatorName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Edit Profile Image Button */}
                {isOwnProfile && (
                  <>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setTempProfileImage(url);
                          setIsEditingProfile(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f] transition opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Name and Follow */}
              <div className="flex items-start justify-between mt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{creatorName}</h1>
                    <GoldenCheckmark size={22} />
                    {isOwnProfile && (
                      <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/40 rounded border border-white/10">
                        Not editable
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/50">@{creatorUsername}</span>
                  </div>
                </div>
                {isAuthenticated && !isOwnProfile && (
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-5 py-2 rounded-xl font-semibold transition ${
                      isFollowing
                        ? "bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
                        : "bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f]"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
                {isOwnProfile && isEditingProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTempProfileImage(null);
                        setTempCoverImage(null);
                        setIsEditingProfile(false);
                      }}
                      className="px-4 py-2 rounded-xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Save profile changes to API
                        console.log("Saving profile changes...");
                        setIsEditingProfile(false);
                      }}
                      className="px-4 py-2 rounded-xl font-semibold bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f] transition"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {creatorBio && (
                <p className="text-white/70 mt-3 text-sm leading-relaxed">{creatorBio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div>
                  <span className="font-semibold text-white">{formatNumber(creatorFollowers)}</span>
                  <span className="text-white/50 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-white">{formatNumber(creatorFollowing)}</span>
                  <span className="text-white/50 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-semibold text-white">{formatNumber(stats.totalPosts)}</span>
                  <span className="text-white/50 ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold text-white">{formatNumber(stats.totalLikes)}</span>
                  <span className="text-white/50 ml-1">Likes</span>
                </div>
              </div>

              {/* Subscription Card */}
              <SubscriptionCard
                plan={subscriptionPlan}
                isSubscribed={isSubscribed}
                subscription={subscription}
                walletAddress={walletAddress}
                isAuthenticated={isAuthenticated}
                onSubscribe={handleSubscribe}
                isLoading={subscribingLoading}
                isOwnProfile={isOwnProfile}
              />
            </div>

            {/* Posts Header */}
            <div className="flex items-center justify-between px-4 border-b border-white/10 pb-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white">Posts</h2>
              <span className="text-sm text-white/50">{posts.length} posts</span>
            </div>

            {/* Posts */}
            <div className="space-y-3 px-0">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    creator={{
                      name: creatorName,
                      username: creatorUsername,
                      profileImage: creatorProfileImage
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-white/50">No posts yet</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
