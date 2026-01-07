"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/lib/icons";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function PostCard({ post }) {
  const { user } = useCurrentUser();
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => like._id === user?._id) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.data.liked);
        setLikesCount(data.data.likesCount);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString();
  };

  const creator = post.creator || {};
  const displayName = creator.username || creator.walletAddress?.slice(0, 6) || "Anonymous";

  return (
    <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${creator._id || creator.walletAddress}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#d4ed31]/40 to-purple-500/40 flex items-center justify-center flex-shrink-0">
              {creator.profile?.avatar ? (
                <Image
                  src={creator.profile.avatar}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-lg sm:text-xl font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${creator._id || creator.walletAddress}`}
              className="block font-semibold text-sm sm:text-base text-white hover:text-[#d4ed31] transition truncate"
            >
              {displayName}
            </Link>
            <p className="text-xs sm:text-sm text-white/60">
              {formatTime(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/60"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full aspect-square bg-black/20">
          {post.images.length === 1 ? (
            <Image
              src={post.images[0].url}
              alt="Post"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          ) : (
            <div className="relative w-full h-full">
              {/* Image carousel would go here */}
              <Image
                src={post.images[0].url}
                alt="Post"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
              {post.images.length > 1 && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-black/60 text-xs text-white backdrop-blur-sm">
                  {post.images.length} photos
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-1 hover:opacity-70 transition disabled:opacity-50"
            >
              {isLiked ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-red-500"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:opacity-70 transition"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button className="flex items-center gap-1 hover:opacity-70 transition">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
          <button className="hover:opacity-70 transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <p className="text-sm font-semibold text-white">
            {likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Post Content */}
        <div>
          <Link
            href={`/profile/${creator._id || creator.walletAddress}`}
            className="font-semibold text-sm sm:text-base text-white hover:text-[#d4ed31] transition mr-2"
          >
            {displayName}
          </Link>
          <span className="text-sm sm:text-base text-white/90 whitespace-pre-wrap break-words">
            {post.content}
          </span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <Link
                key={idx}
                href={`/explore/tags/${tag}`}
                className="text-xs sm:text-sm text-[#d4ed31] hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* View Comments */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs sm:text-sm text-white/60 hover:text-white/80 transition"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <p className="text-xs text-white/60">Comments coming soon...</p>
          </div>
        )}
      </div>
    </article>
  );
}

