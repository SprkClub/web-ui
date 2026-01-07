"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
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

export default function FeedPage() {
  const { isAuthenticated } = useCurrentUser();
  const { openModal } = useLoginModal();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts?page=${page}&limit=10&sortBy=createdAt&order=desc`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setPosts(data.data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.data.posts]);
        }
        setHasMore(data.data.currentPage < data.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-2xl mx-auto">
          {/* Create Post Button */}
          <div className="flex items-center justify-between flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Feed</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Create Post</span>
            </button>
          </div>

          {/* Posts Feed */}
          <main className="no-scrollbar flex flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto pb-6 min-h-0 h-full">
            {loading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31]"></div>
                  <p className="mt-4 text-gray-400">Loading posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/40"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </div>
                  <p className="text-xl text-white/60">No posts yet</p>
                  <p className="text-sm text-white/40">
                    Be the first to share something!
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
                  >
                    Create First Post
                  </button>
                </div>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
    </RequireAuth>
  );
}

