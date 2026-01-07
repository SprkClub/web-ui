"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";

export default function Dashboard() {
  const { ready, isAuthenticated, displayName, username, profileImage, walletAddress, isCreator, hasPendingApplication, creatorStatus } = usePrivyAuth();

  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <RequireAuth>
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Pending Application Banner */}
        {hasPendingApplication && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-400">Application Under Review</h3>
                <p className="text-white/60 text-sm">Your creator application is being reviewed by our team. This usually takes 24-48 hours.</p>
              </div>
              <div className="flex-shrink-0">
                <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <span className="text-orange-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Creator Status Banner */}
        {isCreator && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-400">Verified Creator</h3>
                <p className="text-white/60 text-sm">You can now create posts and share content with your audience.</p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-500/30 transition"
              >
                Create Post
              </Link>
            </div>
          </div>
        )}

        {/* Rejected Application Banner */}
        {creatorStatus === 'rejected' && !isCreator && !hasPendingApplication && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400">Application Not Approved</h3>
                <p className="text-white/60 text-sm">Your previous application was not approved. You can apply again with updated information.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/50">Welcome back, {displayName || "User"}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {profileImage ? (
              <img src={profileImage} alt="" className="w-20 h-20 rounded-full border-2 border-[#d4ed31]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white/50">
                {displayName?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">{displayName}</h2>
              {username && <p className="text-[#d4ed31]">@{username}</p>}
              {walletAddress && (
                <p className="text-white/40 text-sm font-mono mt-1">{formatAddress(walletAddress)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link
            href="/profile"
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center"
          >
            <p className="text-white font-medium">View Profile</p>
            <p className="text-white/40 text-sm">Edit your public profile</p>
          </Link>
          <Link
            href="/coins"
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center"
          >
            <p className="text-white font-medium">Explore Coins</p>
            <p className="text-white/40 text-sm">Discover trending tokens</p>
          </Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
