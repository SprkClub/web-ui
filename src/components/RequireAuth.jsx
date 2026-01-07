"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { ready, isAuthenticated, login } = usePrivyAuth();

  // Show loading while checking auth
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050207]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
          <p className="mt-4 text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050207]">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <Icons.User size={40} className="text-white/30" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in Required</h1>
            <p className="text-white/50">
              Connect with X (Twitter) to access this page and explore all features.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={login}
              className="w-full px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition border border-white/10"
            >
              Go to Home
            </button>
          </div>
          <p className="text-xs text-white/30">
            X authentication is required to create posts, follow creators, and apply to become a creator.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
