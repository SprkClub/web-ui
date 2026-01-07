"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import RequireAuth from "@/components/RequireAuth";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

const CATEGORIES = [
  "Crypto & Web3",
  "Trading & Finance",
  "NFTs & Art",
  "DeFi",
  "Gaming",
  "Technology",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Other",
];

const SOCIAL_PLATFORMS = [
  { id: "twitter", label: "X (Twitter)", icon: "𝕏", placeholder: "https://x.com/username" },
  { id: "instagram", label: "Instagram", icon: "📷", placeholder: "https://instagram.com/username" },
  { id: "youtube", label: "YouTube", icon: "▶️", placeholder: "https://youtube.com/@channel" },
  { id: "tiktok", label: "TikTok", icon: "🎵", placeholder: "https://tiktok.com/@username" },
  { id: "discord", label: "Discord", icon: "💬", placeholder: "https://discord.gg/invite" },
  { id: "telegram", label: "Telegram", icon: "✈️", placeholder: "https://t.me/username" },
  { id: "website", label: "Website", icon: "🌐", placeholder: "https://yourwebsite.com" },
];

function BecomeCreatorContent() {
  const router = useRouter();
  const {
    username,
    displayName: authDisplayName,
    profileImage,
    isCreator,
    hasPendingApplication,
    refreshCreatorStatus
  } = usePrivyAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [socialLinks, setSocialLinks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (authDisplayName) {
      setDisplayName(authDisplayName);
    }
  }, [authDisplayName]);

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Filter out empty social links
      const filteredSocialLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([_, value]) => value.trim())
      );

      const response = await fetch("/api/creator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          category,
          socialLinks: filteredSocialLinks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      refreshCreatorStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already a creator
  if (isCreator) {
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

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">You're Already a Creator!</h1>
                <p className="text-white/50">
                  You have creator access. Go to your profile to manage your content.
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-block px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has pending application
  if (hasPendingApplication) {
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

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Application Pending</h1>
                <p className="text-white/50">
                  Your creator application is being reviewed. We'll notify you once it's processed.
                </p>
              </div>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition border border-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
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

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#d4ed31]/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Application Submitted!</h1>
                <p className="text-white/50">
                  Thank you for applying! Our team will review your application and get back to you soon.
                </p>
              </div>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-2xl mx-auto">
          <main className="no-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Header */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href="/"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Become a Creator</h1>
                <p className="text-white/50 text-sm">Apply to get verified and unlock creator features</p>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Preview */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[#d4ed31]">
                        {displayName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{displayName || "Your Name"}</p>
                    <p className="text-sm text-white/50">@{username || "username"}</p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your creator name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#d4ed31]/50 transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#d4ed31]/50 transition appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1a1a]">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Bio <span className="text-red-400">*</span>
                  <span className="text-white/40 font-normal ml-2">(min 50 characters)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your content, and why you want to become a creator..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-[#d4ed31]/50 transition"
                />
                <p className={`text-xs mt-1 ${bio.length < 50 ? 'text-red-400' : 'text-white/40'}`}>
                  {bio.length}/50 minimum characters
                </p>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Social Links
                  <span className="text-white/40 font-normal ml-2">(at least one recommended)</span>
                </label>
                <div className="space-y-3">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <div key={platform.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                        {platform.icon}
                      </div>
                      <input
                        type="url"
                        value={socialLinks[platform.id] || ""}
                        onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#d4ed31]/50 transition text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || bio.length < 50 || !category || !displayName.trim()}
                className="w-full px-6 py-4 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>

              <p className="text-center text-xs text-white/40">
                By submitting, you agree to our terms and acknowledge that your application will be reviewed by our team.
              </p>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function BecomeCreatorPage() {
  return (
    <RequireAuth>
      <BecomeCreatorContent />
    </RequireAuth>
  );
}
