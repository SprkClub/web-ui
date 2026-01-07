"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import EditProfileModal from "@/components/EditProfileModal";
import RequireAuth from "@/components/RequireAuth";
import WalletConnectButton, { WalletDisplay } from "@/components/WalletConnectButton";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useWallets } from "@privy-io/react-auth";
import { Icons } from "@/lib/icons";

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

// Subscription Card Component for displaying user's subscriptions
function SubscriptionItem({ subscription }) {
  const isActive = new Date(subscription.expiresAt) > new Date();
  const daysLeft = Math.ceil(
    (new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
          {subscription.creator?.profileImage ? (
            <img
              src={subscription.creator.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-[#d4ed31]">
              {subscription.creator?.name?.charAt(0) || "?"}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{subscription.creator?.name || "Creator"}</p>
            <GoldenCheckmark size={14} />
          </div>
          <p className="text-xs text-white/50">@{subscription.creator?.username}</p>
        </div>
      </div>
      <div className="text-right">
        {isActive ? (
          <>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Active
            </span>
            <p className="text-xs text-white/50 mt-1">{daysLeft} days left</p>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
            Expired
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { ready, isAuthenticated, username, displayName, profileImage, isCreator, walletAddress: authWalletAddress } = usePrivyAuth();
  const { wallets } = useWallets();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  const primaryWallet = wallets?.[0];
  const walletAddress = primaryWallet?.address || authWalletAddress;

  // User data (in real app, this would come from API)
  const [userData, setUserData] = useState({
    username: username || "user",
    displayName: displayName || username || "User",
    bio: "",
    profileImage: profileImage || null,
    coverImage: null,
    followers: 0,
    following: 0,
    isCreator: isCreator || false,
  });

  // Update userData when auth data changes
  useEffect(() => {
    if (ready && isAuthenticated) {
      setUserData((prev) => ({
        ...prev,
        username: username || "user",
        displayName: displayName || username || "User",
        profileImage: profileImage || null,
        isCreator: isCreator || false,
      }));
    }
  }, [ready, isAuthenticated, username, displayName, profileImage, isCreator]);

  // Fetch user's subscriptions
  useEffect(() => {
    if (ready && isAuthenticated) {
      fetchSubscriptions();
    }
  }, [ready, isAuthenticated]);

  async function fetchSubscriptions() {
    try {
      const res = await fetch("/api/subscriptions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoadingSubscriptions(false);
    }
  }

  const handleSaveProfile = async (updatedData) => {
    // TODO: Save to API
    console.log("Saving profile:", updatedData);

    setUserData((prev) => ({
      ...prev,
      displayName: updatedData.displayName || prev.displayName,
      bio: updatedData.bio || prev.bio,
      profileImage: updatedData.profileImage || prev.profileImage,
      coverImage: updatedData.coverImage || prev.coverImage,
    }));
  };

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
            <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pb-6 min-h-0 h-full">
              {/* Cover Image */}
              <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-[#d4ed31]/20 to-purple-500/20 flex-shrink-0">
                {userData.coverImage ? (
                  <img src={userData.coverImage} alt="" className="w-full h-full object-cover" />
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
              </div>

              {/* Profile Info */}
              <div className="relative px-4 -mt-12 flex-shrink-0">
                {/* Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <div className="w-full h-full rounded-full bg-[#050207] p-1">
                    <div className="w-full h-full rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
                      {userData.profileImage ? (
                        <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold text-[#d4ed31]">
                          {userData.displayName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name and Edit Button */}
                <div className="flex items-start justify-between mt-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">{userData.displayName}</h1>
                      {userData.isCreator && <GoldenCheckmark size={22} />}
                    </div>
                    <span className="text-white/50">@{userData.username}</span>
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition text-sm"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Bio */}
                {userData.bio && (
                  <p className="text-white/70 mt-3 text-sm leading-relaxed">{userData.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div>
                    <span className="font-semibold text-white">{formatNumber(userData.followers)}</span>
                    <span className="text-white/50 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">{formatNumber(userData.following)}</span>
                    <span className="text-white/50 ml-1">Following</span>
                  </div>
                </div>
              </div>

              {/* Creator Dashboard Link - Only for Creators */}
              {isCreator && (
                <div className="px-4">
                  <Link
                    href="/creator/dashboard"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#d4ed31]/20 to-orange-500/20 border border-[#d4ed31]/30 hover:from-[#d4ed31]/30 hover:to-orange-500/30 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4ed31]/20 flex items-center justify-center">
                        <GoldenCheckmark size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Creator Dashboard</p>
                        <p className="text-xs text-white/50">Manage your content & subscriptions</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Wallet Section */}
              <div className="px-4">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Wallet
                </h2>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  {walletAddress ? (
                    <div className="space-y-3">
                      <WalletDisplay address={walletAddress} />
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/50">Balance</p>
                          <p className="font-semibold text-white">0 SOL</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/50">USD Value</p>
                          <p className="font-semibold text-white/70">$0.00</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white/50 mb-3">Connect your wallet to view balance</p>
                      <WalletConnectButton variant="primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriptions Section - For Regular Users */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    My Subscriptions
                  </h2>
                  <span className="text-sm text-white/50">{subscriptions.length} active</span>
                </div>

                {loadingSubscriptions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#d4ed31] border-t-transparent" />
                  </div>
                ) : subscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <SubscriptionItem key={sub.id} subscription={sub} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <p className="text-white/50">No subscriptions yet</p>
                    <p className="text-white/30 text-sm mt-1 mb-4">Subscribe to creators for exclusive access</p>
                    <Link
                      href="/top-creators"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Discover Creators
                    </Link>
                  </div>
                )}
              </div>

              {/* Explore Creators CTA - Only for Non-Creators */}
              {!isCreator && (
                <div className="px-4 mt-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Become a Creator</p>
                        <p className="text-xs text-white/50">Share content & earn from subscribers</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mb-4">
                      Apply to become a verified creator on SparksClub. Set your own subscription price and offer exclusive content to your fans.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition text-sm"
                    >
                      Learn More
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userData={userData}
          onSave={handleSaveProfile}
        />
      </div>
    </RequireAuth>
  );
}
