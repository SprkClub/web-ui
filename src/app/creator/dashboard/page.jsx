"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import WalletConnectButton, { WalletDisplay } from "@/components/WalletConnectButton";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useWallets } from "@privy-io/react-auth";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toString() || "0";
}

function StatCard({ title, value, icon: Icon, trend, color = "white" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-sm">{title}</span>
        {Icon && <Icon size={18} className="text-white/30" />}
      </div>
      <p className={`text-2xl font-bold ${color === "accent" ? "text-[#d4ed31]" : "text-white"}`}>
        {value}
      </p>
      {trend !== undefined && (
        <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? "+" : ""}{trend}% from last week
        </p>
      )}
    </div>
  );
}

// Alert component
function Alert({ type = "success", message, onClose }) {
  const bgColor = type === "success" ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30";
  const textColor = type === "success" ? "text-green-400" : "text-red-400";

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border ${bgColor} backdrop-blur-sm animate-slide-in`}>
      <div className="flex items-center gap-3">
        <span className={textColor}>{message}</span>
        <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
          <Icons.Close size={16} />
        </button>
      </div>
    </div>
  );
}

// Subscription Icon (custom SVG since it's not in the icons)
function SubscriptionIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, ready, isCreator, isSyncing, creatorStatusChecked, displayName, username, profileImage, walletAddress: authWalletAddress, linkWallet } = usePrivyAuth();
  const { wallets } = useWallets();
  const isLoading = !ready || isSyncing || (isAuthenticated && !creatorStatusChecked);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription"); // Default to subscription tab
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [alert, setAlert] = useState(null);

  // Subscription state
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: "",
    description: "",
    price: "",
    walletAddress: "",
  });

  // Get wallet address from multiple sources
  const primaryWallet = wallets?.[0];
  const walletAddress = authWalletAddress || primaryWallet?.address || user?.wallet?.address;

  // Check if user is a creator
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (!isLoading && isAuthenticated && !isCreator) {
      router.push("/");
      return;
    }

    // Fetch creator stats
    if (isCreator) {
      fetchCreatorStats();
      fetchSubscriptionPlan();
      fetchSubscribers();
    }
  }, [isLoading, isAuthenticated, isCreator, router]);

  // Update wallet address in form when wallet connects
  useEffect(() => {
    if (walletAddress && !planForm.walletAddress) {
      setPlanForm(prev => ({ ...prev, walletAddress }));
    }
  }, [walletAddress]);

  async function fetchCreatorStats() {
    try {
      // Fetch user's posts
      const postsRes = await fetch("/api/posts/me", { credentials: "include" });
      if (postsRes.ok) {
        const data = await postsRes.json();
        const fetchedPosts = data.posts || [];
        setPosts(fetchedPosts);

        // Calculate stats from posts
        setStats({
          totalPosts: fetchedPosts.length,
          totalLikes: fetchedPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
          totalViews: fetchedPosts.reduce((sum, p) => sum + (p.views || 0), 0),
          followers: 0,
          following: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchSubscriptionPlan() {
    try {
      const res = await fetch("/api/creator/subscription", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionPlan(data.plan);
        setSubscriberCount(data.subscriberCount || 0);
        if (data.plan) {
          setPlanForm({
            title: data.plan.title || "",
            description: data.plan.description || "",
            price: data.plan.price?.toString() || "0",
            walletAddress: data.plan.walletAddress || walletAddress || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
    } finally {
      setLoadingSubscription(false);
    }
  }

  async function fetchSubscribers() {
    try {
      const res = await fetch("/api/creator/subscribers?active=true", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  }

  async function handleSavePlan(e) {
    e.preventDefault();

    if (!walletAddress) {
      setAlert({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    setSavingPlan(true);
    try {
      const res = await fetch("/api/creator/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: planForm.title,
          description: planForm.description,
          price: parseFloat(planForm.price) || 0,
          walletAddress: walletAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubscriptionPlan(data.plan);
        setAlert({ type: "success", message: "Subscription plan saved successfully!" });
      } else {
        setAlert({ type: "error", message: data.error || "Failed to save plan" });
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      setAlert({ type: "error", message: "Failed to save plan" });
    } finally {
      setSavingPlan(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050207]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#d4ed31] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !isCreator) {
    return null;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Icons.Home },
    { id: "subscription", label: "Subscription", icon: SubscriptionIcon },
    { id: "posts", label: "Posts", icon: Icons.Edit },
    { id: "analytics", label: "Analytics", icon: Icons.TrendingUp },
    { id: "settings", label: "Settings", icon: Icons.Settings },
  ];

  return (
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

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
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[#d4ed31]">
                    {displayName?.charAt(0) || username?.charAt(0) || "C"}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Creator Dashboard</h1>
                  <GoldenCheckmark size={18} />
                </div>
                <p className="text-sm text-white/50">@{username || "creator"}</p>
              </div>
            </div>
            <Link
              href={`/creator/${username}`}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition text-sm font-medium"
            >
              View Public Profile
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "subscription") {
                    fetchSubscribers();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-[#d4ed31] text-[#050207]"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Posts"
                    value={formatNumber(stats?.totalPosts || 0)}
                    icon={Icons.Edit}
                    trend={12}
                  />
                  <StatCard
                    title="Total Likes"
                    value={formatNumber(stats?.totalLikes || 0)}
                    icon={Icons.Heart}
                    trend={8}
                  />
                  <StatCard
                    title="Followers"
                    value={formatNumber(stats?.followers || 0)}
                    icon={Icons.User}
                    trend={15}
                  />
                  <StatCard
                    title="Subscribers"
                    value={formatNumber(subscriberCount)}
                    icon={SubscriptionIcon}
                    color="accent"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#d4ed31]/10 border border-[#d4ed31]/30 hover:bg-[#d4ed31]/20 transition">
                      <Icons.Edit size={24} className="text-[#d4ed31]" />
                      <span className="text-sm font-medium">Create Post</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("subscription")}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                    >
                      <SubscriptionIcon size={24} className="text-white/70" />
                      <span className="text-sm font-medium">Subscription</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      <Icons.TrendingUp size={24} className="text-white/70" />
                      <span className="text-sm font-medium">Analytics</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      <Icons.Settings size={24} className="text-white/70" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  {posts.length > 0 ? (
                    <div className="space-y-3">
                      {posts.slice(0, 5).map((post) => (
                        <div
                          key={post._id || post.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{post.content}</p>
                            <p className="text-xs text-white/50 mt-1">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Icons.Heart size={14} />
                              {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Icons.Edit size={24} className="text-white/30" />
                      </div>
                      <p className="text-white/50">No posts yet</p>
                      <p className="text-sm text-white/30 mt-1">Create your first post to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="space-y-6">
                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#d4ed31] border-t-transparent" />
                  </div>
                ) : (
                  <>
                {/* Wallet Connection Section */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Wallet Connection
                  </h2>
                  <p className="text-sm text-white/60 mb-4">
                    Connect your Solana wallet to receive subscription payments from your fans.
                  </p>
                  {walletAddress ? (
                    <div className="space-y-3">
                      <WalletDisplay address={walletAddress} />
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Wallet connected - you can create your subscription plan
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => linkWallet()}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Connect Wallet
                    </button>
                  )}
                </div>

                {/* Subscription Plan Form */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <SubscriptionIcon size={20} className="text-[#d4ed31]" />
                    Exclusive Access Plan
                  </h2>
                  <p className="text-sm text-white/60 mb-6">
                    Set up your subscription plan for fans who want exclusive access to your content.
                  </p>

                  <form onSubmit={handleSavePlan} className="space-y-5">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Plan Title *</label>
                      <input
                        type="text"
                        value={planForm.title}
                        onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                        placeholder="e.g., VIP Access, Premium Content, etc."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none"
                        required
                        minLength={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">Description *</label>
                      <textarea
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        placeholder="Describe what subscribers will get with this plan..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none resize-none"
                        required
                        minLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">Price (SOL) *</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full px-4 py-3 pr-16 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">SOL</span>
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Set to 0 for free access. Price is per month.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">Duration</label>
                      <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50">
                        1 Month (Fixed)
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Subscriptions renew monthly.
                      </p>
                    </div>

                    {/* Plan Preview */}
                    {(planForm.title || planForm.price) && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#d4ed31]/10 to-purple-500/10 border border-[#d4ed31]/30">
                        <p className="text-xs text-white/50 mb-2">Preview</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{planForm.title || "Your Plan"}</h3>
                            <p className="text-sm text-white/50">1 Month Access</p>
                          </div>
                          <div className="text-right">
                            {parseFloat(planForm.price) === 0 ? (
                              <span className="text-lg font-bold text-green-400">FREE</span>
                            ) : (
                              <span className="text-lg font-bold text-[#d4ed31]">
                                {planForm.price || "0"} SOL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={savingPlan || !walletAddress}
                      className="w-full px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingPlan ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#050207] border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : subscriptionPlan ? (
                        "Update Plan"
                      ) : (
                        "Create Plan"
                      )}
                    </button>

                    {!walletAddress && (
                      <p className="text-center text-sm text-orange-400">
                        Please connect your wallet above to save your plan
                      </p>
                    )}
                  </form>
                </div>

                {/* Subscribers Section */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Icons.User size={20} className="text-[#d4ed31]" />
                      Your Subscribers
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-[#d4ed31]/20 text-[#d4ed31] text-sm font-medium">
                      {subscriberCount} active
                    </span>
                  </div>

                  {subscribers.length > 0 ? (
                    <div className="space-y-3">
                      {subscribers.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              {sub.subscriber.profileImage ? (
                                <img
                                  src={sub.subscriber.profileImage}
                                  alt=""
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-white/70">
                                  {sub.subscriber.name?.charAt(0) || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{sub.subscriber.name}</p>
                              <p className="text-xs text-white/50">@{sub.subscriber.username}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#d4ed31]">
                              {sub.price === 0 ? "FREE" : `${sub.price} ${sub.currency}`}
                            </p>
                            <p className="text-xs text-white/50">
                              Expires {new Date(sub.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Icons.User size={24} className="text-white/30" />
                      </div>
                      <p className="text-white/50">No subscribers yet</p>
                      <p className="text-sm text-white/30 mt-1">
                        {subscriptionPlan
                          ? "Share your profile to get subscribers"
                          : "Create a subscription plan to get started"}
                      </p>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Posts</h2>
                  <button className="px-4 py-2 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition text-sm">
                    Create Post
                  </button>
                </div>
                {posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post._id || post.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <p className="text-white">{post.content}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt=""
                            className="mt-3 rounded-lg max-h-48 object-cover"
                          />
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <Icons.Heart size={14} />
                            {post.likes?.length || 0} likes
                          </span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Icons.Edit size={32} className="text-white/30" />
                    </div>
                    <p className="text-white/50 text-lg">No posts yet</p>
                    <p className="text-sm text-white/30 mt-1 mb-4">Share your first update with your followers</p>
                    <button className="px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition">
                      Create Your First Post
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Analytics</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Icons.TrendingUp size={32} className="text-white/30" />
                  </div>
                  <p className="text-white/50 text-lg">Analytics Coming Soon</p>
                  <p className="text-sm text-white/30 mt-1">
                    Detailed insights about your posts and audience will appear here
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Creator Settings</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="font-medium mb-4">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Display Name</label>
                      <input
                        type="text"
                        defaultValue={displayName || ""}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#d4ed31]/50 focus:outline-none"
                        placeholder="Your display name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        defaultValue={""}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#d4ed31]/50 focus:outline-none resize-none"
                        placeholder="Tell your audience about yourself..."
                      />
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
