"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { ready, isAuthenticated, login } = usePrivyAuth();
  const [showLoading, setShowLoading] = useState(true);

  // Show loading for max 2 seconds, then allow access
  useEffect(() => {
    if (ready) {
      setShowLoading(false);
    } else {
      // Timeout after 2 seconds to prevent infinite loading
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  // Show loading only briefly
  if (showLoading && !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050207]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
          <p className="mt-4 text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to pages - don't block unauthenticated users
  // Individual features will handle their own auth requirements
  return children;
}
