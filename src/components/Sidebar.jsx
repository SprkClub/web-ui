"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import CreatorApplicationModal from "@/components/CreatorApplicationModal";

// Admin usernames who can access admin panel
const ADMIN_USERNAMES = ["iathulnambiar"];

export default function Sidebar({ items, collapsed, onToggle }) {
  const pathname = usePathname();
  const { ready, isAuthenticated, login, logout, displayName, username, profileImage, isCreator, hasPendingApplication, creatorStatus, refreshCreatorStatus } = usePrivyAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // Check if current user is admin
  const isAdmin = username && ADMIN_USERNAMES.includes(username.toLowerCase());

  // Show apply button only if authenticated, not a creator, not admin, and no pending application
  // Also show if application was rejected (allow re-apply)
  const showApplyButton = isAuthenticated && !isCreator && !isAdmin && !hasPendingApplication;

  // Check if user was rejected and can re-apply
  const wasRejected = creatorStatus === 'rejected' && !isCreator && !hasPendingApplication;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-white/80 hover:bg-white/10 transition"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <Icons.Close size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 4H18M2 10H18M2 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 z-40 h-full lg:h-auto flex-shrink-0 flex-col rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-4 ${
          collapsed ? "lg:w-20" : "lg:w-56"
        } ${
          isMobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#050207] text-white/60 shadow-lg transition hover:bg-white/10 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <Icons.ArrowRight size={10} />
        ) : (
          <Icons.ArrowLeft size={10} />
        )}
      </button>

      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={collapsed ? 80 : 120}
            height={collapsed ? 80 : 120}
            className="flex-shrink-0 drop-shadow-[0_10px_25px_rgba(212,237,49,0.45)]"
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-2 text-sm flex-1 min-h-0">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const needsLogin = ["Notifications", "Profile"].includes(item.label);

          if (needsLogin && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={login}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {typeof item.icon === 'function' ? (
                  <item.icon size={20} className="flex-shrink-0" />
                ) : (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className={collapsed ? "hidden" : "block"}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              {typeof item.icon === 'function' ? (
                <item.icon size={20} className="flex-shrink-0" />
              ) : (
                <span className="flex-shrink-0">{item.icon}</span>
              )}
              <span className={collapsed ? "hidden" : "block"}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Admin Link - only for admins */}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
              pathname === "/admin"
                ? "bg-red-500/20 text-red-400"
                : "text-red-400/70 hover:bg-red-500/10"
            }`}
          >
            <Icons.Settings size={20} className="flex-shrink-0" />
            <span className={collapsed ? "hidden" : "block"}>Admin</span>
          </Link>
        )}

        {/* Special Creator Menu Item with Golden Checkmark - for verified creators */}
        {isCreator && (
          <Link
            href="/creator/dashboard"
            className={`relative mt-2 group block ${pathname === "/creator/dashboard" || pathname?.startsWith("/creator/dashboard") ? "" : ""}`}
          >
            {/* Golden gradient border */}
            <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] ${pathname === "/creator/dashboard" ? "opacity-100" : "opacity-60"} blur-[2px] group-hover:opacity-100 animate-border-spin`} />
            <div className={`relative flex items-center gap-3 rounded-2xl px-3 py-3 bg-[#0a0a0a] text-left transition-all ${pathname === "/creator/dashboard" ? "bg-[#1a1a0a]" : ""}`}>
              <GoldenCheckmark size={20} />
              <span className={`text-white font-semibold ${collapsed ? "hidden" : "block"}`}>
                Creator Dashboard
              </span>
            </div>
          </Link>
        )}

        {/* Apply for Creator Button - with animated border */}
        {(showApplyButton || wasRejected) && (
          <button
            onClick={() => setShowCreatorModal(true)}
            className="relative mt-2 group block w-full text-left"
          >
            {/* Animated gradient border */}
            <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${wasRejected ? 'from-orange-500 via-red-500 to-orange-500' : 'from-[#d4ed31] via-[#f0f] via-[#0ff] to-[#d4ed31]'} opacity-75 blur-[2px] group-hover:opacity-100 animate-border-spin`} />
            <div className="relative flex items-center gap-3 rounded-2xl px-3 py-3 bg-[#0a0a0a] text-left transition-all">
              <svg className={`w-5 h-5 ${wasRejected ? 'text-orange-400' : 'text-[#d4ed31]'} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className={`text-white font-medium ${collapsed ? "hidden" : "block"}`}>
                {wasRejected ? "Re-apply" : "Become Creator"}
              </span>
            </div>
          </button>
        )}

        {/* Pending Application Status */}
        {hasPendingApplication && (
          <div className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 bg-orange-500/10 border border-orange-500/30">
            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            </div>
            <span className={`text-orange-400 text-sm ${collapsed ? "hidden" : "block"}`}>
              Under Review
            </span>
          </div>
        )}
      </nav>

      {/* Bottom Buttons */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-3 text-xs">
        <Link
          href="/coins"
          className="block w-full rounded-2xl bg-[#d4ed31] py-2.5 font-semibold uppercase tracking-wider text-[#050207] transition hover:-translate-y-0.5 hover:bg-[#eaff5f] text-center"
        >
          {collapsed ? "T+C" : "Trend & Coin"}
        </Link>
        {ready && isAuthenticated ? (
          <div className="space-y-2">
            {!collapsed && displayName && (
              <div className="flex items-center gap-2 px-2 py-1">
                {profileImage && (
                  <img src={profileImage} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-white/70 truncate text-xs">{displayName}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full rounded-2xl border border-dashed border-white/30 py-2.5 text-white/70 transition hover:border-white/60"
            >
              {collapsed ? "Exit" : "Logout"}
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            disabled={!ready}
            className="w-full rounded-2xl border border-dashed border-white/30 py-2.5 text-white/70 transition hover:border-white/60 disabled:opacity-50"
          >
            {collapsed ? "Login" : "Login with X"}
          </button>
        )}
      </div>
      </aside>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes border-spin {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-border-spin {
          background-size: 200% 200%;
          animation: border-spin 3s linear infinite;
        }
      `}</style>

      {/* Creator Application Modal */}
      <CreatorApplicationModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
      />
    </>
  );
}
