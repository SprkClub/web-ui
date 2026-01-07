"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import RequireAuth from "@/components/RequireAuth";
import Sidebar from "@/components/Sidebar";
import { Icons } from "@/lib/icons";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

const SOCIAL_ICONS = {
  twitter: "𝕏",
  instagram: "📷",
  youtube: "▶️",
  tiktok: "🎵",
  discord: "💬",
  telegram: "✈️",
  website: "🌐"
};

// Alert Component
function Alert({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500/20 border-green-500/50 text-green-400" :
                  type === "error" ? "bg-red-500/20 border-red-500/50 text-red-400" :
                  "bg-blue-500/20 border-blue-500/50 text-blue-400";

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl border ${bgColor} backdrop-blur-xl shadow-lg flex items-center gap-3 animate-slide-in`}>
      {type === "success" && <span className="text-xl">✓</span>}
      {type === "error" && <span className="text-xl">✕</span>}
      {type === "info" && <span className="text-xl">ℹ</span>}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <Icons.Close size={16} />
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const { ready, isAuthenticated } = usePrivyAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [creatorDisplayName, setCreatorDisplayName] = useState("");
  const [creatorTicker, setCreatorTicker] = useState("");
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
  };

  useEffect(() => {
    if (ready && isAuthenticated) {
      checkAdminAccess();
    } else if (ready && !isAuthenticated) {
      setLoading(false);
    }
  }, [ready, isAuthenticated]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/stats", { credentials: "include" });
      if (response.ok) {
        setIsAdmin(true);
        const data = await response.json();
        setStats(data.stats);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/admin/users?page=1&limit=50", { credentials: "include" });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("Failed to fetch users", "error");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await fetch("/api/admin/applications?status=pending", { credentials: "include" });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      showAlert("Failed to fetch applications", "error");
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "users") fetchUsers();
    else if (activeTab === "applications") fetchApplications();
  }, [activeTab, isAdmin]);

  const handleApplicationAction = async (appId, action) => {
    try {
      const payload = {
        action,
        reviewNote: reviewNote.trim() || undefined,
      };

      if (action === "approve") {
        payload.displayName = creatorDisplayName.trim() || undefined;
        payload.ticker = creatorTicker.trim().toUpperCase() || undefined;
      }

      const response = await fetch(`/api/admin/applications/${appId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setExpandedApp(null);
        setReviewNote("");
        setCreatorDisplayName("");
        setCreatorTicker("");
        fetchApplications();
        checkAdminAccess();
        showAlert(action === "approve" ? "Creator approved successfully!" : "Application rejected", "success");
      } else {
        showAlert("Failed to process application", "error");
      }
    } catch (error) {
      console.error("Error processing application:", error);
      showAlert("Failed to process application", "error");
    }
  };

  const handleToggleBan = async (userId, isBanned, userName) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isBanned: !isBanned }),
      });
      if (response.ok) {
        fetchUsers();
        showAlert(isBanned ? `${userName} has been unbanned` : `${userName} has been banned`, "success");
      } else {
        showAlert("Failed to update user ban status", "error");
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
      showAlert("Failed to update user ban status", "error");
    }
  };

  const handleToggleAdmin = async (userId, isCurrentlyAdmin, userName) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAdmin: !isCurrentlyAdmin }),
      });
      if (response.ok) {
        fetchUsers();
        showAlert(isCurrentlyAdmin ? `${userName} is no longer an admin` : `${userName} is now an admin`, "success");
      } else {
        showAlert("Failed to update admin status", "error");
      }
    } catch (error) {
      console.error("Error toggling admin:", error);
      showAlert("Failed to update admin status", "error");
    }
  };

  const handleToggleCreator = async (userId, isCurrentlyCreator, userName) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isCreator: !isCurrentlyCreator,
          creatorStatus: !isCurrentlyCreator ? "approved" : null
        }),
      });
      if (response.ok) {
        fetchUsers();
        checkAdminAccess();
        showAlert(isCurrentlyCreator ? `${userName} is no longer a creator` : `${userName} is now a creator`, "success");
      } else {
        showAlert("Failed to update creator status", "error");
      }
    } catch (error) {
      console.error("Error toggling creator:", error);
      showAlert("Failed to update creator status", "error");
    }
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-[#050207] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
          <p className="mt-4 text-white/50">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050207] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Icons.Close size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-white/50">You do not have permission to access this page.</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
        {/* Background orbs */}
        <div className="orb absolute -left-32 top-10 h-72 w-72 rounded-full bg-red-500/30 hidden lg:block" />
        <div className="orb absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#4c5259] hidden lg:block" />

        {/* Alert */}
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Main container */}
        <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            items={navItems}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-auto no-scrollbar">
            <div className="max-w-5xl mx-auto pb-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Icons.Settings size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-white/50 text-sm">Full control over SparksClub</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "📊" },
                  { id: "applications", label: "Applications", icon: "📝", badge: stats?.pendingApplications },
                  { id: "users", label: "Users", icon: "👥" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#d4ed31] text-[#050207]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <span className="text-lg">👥</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                      <p className="text-sm text-white/50">Total Users</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d4ed31]/20 flex items-center justify-center">
                          <span className="text-lg">⭐</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.totalCreators || 0}</p>
                      <p className="text-sm text-white/50">Creators</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <span className="text-lg">📝</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.totalPosts || 0}</p>
                      <p className="text-sm text-white/50">Total Posts</p>
                    </div>
                    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                          <span className="text-lg">⏳</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-orange-400">{stats?.pendingApplications || 0}</p>
                      <p className="text-sm text-orange-400/70">Pending Applications</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setActiveTab("applications")}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                      >
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-medium text-white">Review Applications</p>
                          <p className="text-xs text-white/50">{stats?.pendingApplications || 0} pending</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                      >
                        <span className="text-2xl">👥</span>
                        <div>
                          <p className="font-medium text-white">Manage Users</p>
                          <p className="text-xs text-white/50">{stats?.totalUsers || 0} users</p>
                        </div>
                      </button>
                      <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                      >
                        <span className="text-2xl">🏠</span>
                        <div>
                          <p className="font-medium text-white">View Feed</p>
                          <p className="text-xs text-white/50">Go to home</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Applications Tab */}
              {activeTab === "applications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Creator Applications</h2>
                    <button onClick={fetchApplications} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition text-sm border border-white/10">
                      <span>🔄</span> Refresh
                    </button>
                  </div>
                  {applicationsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4ed31]"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-16 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-4xl mb-4 block">✨</span>
                      No pending applications
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const isExpanded = expandedApp === app._id;
                        const socialLinks = app.socialLinks || {};
                        const hasSocialLinks = Object.keys(socialLinks).length > 0;

                        return (
                          <div key={app._id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden ring-2 ring-white/10">
                                      {app.user?.profileImage ? (
                                        <img src={app.user.profileImage} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <Icons.User size={28} className="text-white/50" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-white text-lg">{app.displayName}</p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#d4ed31]">@{app.user?.twitterUsername || "unknown"}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">{app.category}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-white/50 mb-1">Bio</p>
                                    <p className="text-white/80 text-sm leading-relaxed">{app.bio}</p>
                                  </div>

                                  {hasSocialLinks && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {Object.entries(socialLinks).map(([platform, url]) => (
                                        <a
                                          key={platform}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
                                        >
                                          <span>{SOCIAL_ICONS[platform] || "🔗"}</span>
                                          <span className="text-white/70 capitalize">{platform}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  <p className="text-xs text-white/40">
                                    Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                </div>

                                <button
                                  onClick={() => {
                                    if (isExpanded) {
                                      setExpandedApp(null);
                                      setReviewNote("");
                                      setCreatorDisplayName("");
                                      setCreatorTicker("");
                                    } else {
                                      setExpandedApp(app._id);
                                      setReviewNote("");
                                      setCreatorDisplayName(app.displayName || "");
                                      setCreatorTicker("");
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg bg-[#d4ed31]/20 text-[#d4ed31] hover:bg-[#d4ed31]/30 transition text-sm font-medium"
                                >
                                  {isExpanded ? "Cancel" : "Review"}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-white/10 bg-white/[0.02] p-5">
                                <div className="mb-6 p-4 rounded-xl bg-[#d4ed31]/5 border border-[#d4ed31]/20">
                                  <h4 className="text-sm font-semibold text-[#d4ed31] mb-4">Creator Profile Settings</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-white/50 mb-1.5">Display Name</label>
                                      <input
                                        type="text"
                                        value={creatorDisplayName}
                                        onChange={(e) => setCreatorDisplayName(e.target.value)}
                                        placeholder="Creator display name"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-white/50 mb-1.5">Token Ticker</label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4ed31] font-semibold">$</span>
                                        <input
                                          type="text"
                                          value={creatorTicker}
                                          onChange={(e) => setCreatorTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                                          placeholder="TICKER"
                                          className="w-full rounded-lg border border-white/10 bg-white/5 pl-7 pr-3 py-2 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none text-sm uppercase"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-white/70 mb-2">Review Note (optional)</label>
                                  <textarea
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Add a note for the applicant..."
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-[#d4ed31]/50 focus:outline-none resize-none text-sm"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleApplicationAction(app._id, "approve")}
                                    className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition font-medium border border-green-500/30"
                                  >
                                    ✓ Approve Creator
                                  </button>
                                  <button
                                    onClick={() => handleApplicationAction(app._id, "reject")}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium border border-red-500/30"
                                  >
                                    ✕ Reject Application
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">User Management</h2>
                    <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition text-sm border border-white/10">
                      <span>🔄</span> Refresh
                    </button>
                  </div>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4ed31]"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-16 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-4xl mb-4 block">👥</span>
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/[0.07] transition">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                {user.profileImage ? (
                                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Icons.User size={24} className="text-white/50" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-white">{user.displayName || user.twitterName || "Anonymous"}</p>
                                  <div className="flex gap-1">
                                    {user.isAdmin && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-medium">ADMIN</span>}
                                    {user.isCreator && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-medium">CREATOR</span>}
                                    {user.isBanned && <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 font-medium">BANNED</span>}
                                  </div>
                                </div>
                                <p className="text-sm text-white/50">
                                  {user.twitterUsername ? `@${user.twitterUsername}` : user.walletAddress?.slice(0, 10) + "..."}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Make Admin Button */}
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.displayName || user.twitterName || "User")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                  user.isAdmin
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                    : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                                }`}
                              >
                                {user.isAdmin ? "Remove Admin" : "Make Admin"}
                              </button>

                              {/* Make Creator Button */}
                              <button
                                onClick={() => handleToggleCreator(user.id, user.isCreator, user.displayName || user.twitterName || "User")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                  user.isCreator
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                                    : "bg-[#d4ed31]/20 text-[#d4ed31] hover:bg-[#d4ed31]/30 border border-[#d4ed31]/30"
                                }`}
                              >
                                {user.isCreator ? "Remove Creator" : "Make Creator"}
                              </button>

                              {/* Ban Button */}
                              <button
                                onClick={() => handleToggleBan(user.id, user.isBanned, user.displayName || user.twitterName || "User")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                  user.isBanned
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                    : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
                                }`}
                              >
                                {user.isBanned ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
    </RequireAuth>
  );
}
