"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLoginModal } from "@/contexts/LoginModalContext";
import Link from "next/link";
import Image from "next/image";
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

export default function FollowingPage() {
  const { user, isAuthenticated } = useCurrentUser();
  const { openModal } = useLoginModal();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Following");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFollowing();
      fetchFollowers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFollowing = async () => {
    try {
      const response = await fetch("/api/users/following", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setFollowing(data.data.following || []);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch("/api/users/followers", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setFollowers(data.data.followers || []);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        credentials: "include",
      });
      if (response.ok) {
        fetchFollowing();
        fetchFollowers();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const currentList = activeTab === "Following" ? following : followers;

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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {user?.username || "User"}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 flex-shrink-0">
            <button
              onClick={() => setActiveTab("Following")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "Following"
                  ? "text-white border-[#d4ed31]"
                  : "text-white/60 border-transparent hover:text-white/80"
              }`}
            >
              Following ({following.length})
            </button>
            <button
              onClick={() => setActiveTab("Followers")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "Followers"
                  ? "text-white border-[#d4ed31]"
                  : "text-white/60 border-transparent hover:text-white/80"
              }`}
            >
              Followers ({followers.length})
            </button>
          </div>

          {/* User List */}
          <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pb-6 min-h-0 h-full">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
                  <p className="mt-4 text-gray-400">Loading...</p>
                </div>
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/40"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <p className="text-xl text-white/60">
                    No {activeTab.toLowerCase()} yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentList.map((userItem) => (
                  <div
                    key={userItem._id || userItem.walletAddress}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    <Link
                      href={`/profile/${userItem._id || userItem.walletAddress}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4ed31]/40 to-purple-500/40 flex items-center justify-center flex-shrink-0">
                        {userItem.profile?.avatar ? (
                          <Image
                            src={userItem.profile.avatar}
                            alt={userItem.username}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-white">
                            {userItem.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {userItem.username || userItem.walletAddress?.slice(0, 8)}
                        </p>
                        <p className="text-sm text-white/60 truncate">
                          {userItem.walletAddress?.slice(0, 12)}...
                        </p>
                      </div>
                    </Link>
                    {activeTab === "Followers" && (
                      <button
                        onClick={() =>
                          handleFollow(
                            userItem._id || userItem.walletAddress,
                            following.some(
                              (f) =>
                                (f._id || f.walletAddress) ===
                                (userItem._id || userItem.walletAddress)
                            )
                          )
                        }
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          following.some(
                            (f) =>
                              (f._id || f.walletAddress) ===
                              (userItem._id || userItem.walletAddress)
                          )
                            ? "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                            : "bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f]"
                        }`}
                      >
                        {following.some(
                          (f) =>
                            (f._id || f.walletAddress) ===
                            (userItem._id || userItem.walletAddress)
                        )
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}
                  </div>
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

