"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLoginModal } from "@/contexts/LoginModalContext";
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

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useCurrentUser();
  const { openModal } = useLoginModal();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "X Account", "System"];

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
          <SearchBar />
          
          <main className="no-scrollbar flex flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? "text-white border-b-2 border-[#d4ed31]"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center py-8 sm:py-16">
              <div className="text-center">
                {/* Sad flame icon */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-4 sm:mb-6 opacity-50 sm:w-[120px] sm:h-[120px]"
                >
                  <path
                    d="M60 20C50 20 40 25 35 35C30 45 32 55 40 60C42 62 43 65 43 68C43 75 38 80 30 80C25 80 20 85 20 90C20 95 25 100 30 100H90C95 100 100 95 100 90C100 85 95 80 90 80C82 80 77 75 77 68C77 65 78 62 80 60C88 55 90 45 85 35C80 25 70 20 60 20Z"
                    fill="currentColor"
                    className="text-white/30"
                  />
                  {/* Sad mouth */}
                  <path
                    d="M45 70 Q50 75 55 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    className="text-white/30"
                  />
                </svg>
                <p className="text-base sm:text-xl text-white/60">No more notifications</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

