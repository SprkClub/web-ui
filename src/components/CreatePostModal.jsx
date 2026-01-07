"use client";

import { useState, useRef } from "react";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { displayName, username, profileImage } = usePrivyAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          { file, preview: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      setError("Please add content or images");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (tags) {
        formData.append("tags", tags);
      }

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const response = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Reset form
      setContent("");
      setImages([]);
      setTags("");
      onPostCreated?.(data.data.post);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <Icons.User size={20} className="text-white/50" />
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{displayName || "User"}</p>
              {username && <p className="text-xs text-white/60">@{username}</p>}
            </div>
          </div>

          {/* Content Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[200px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none resize-none"
            maxLength={5000}
          />
          <p className="text-xs text-white/60 text-right">
            {content.length}/5000
          </p>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={`image-${index}-${img.file.name}`} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                  >
                    <Icons.Close size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="w-full rounded-xl border-2 border-dashed border-white/20 p-6 text-center hover:border-[#d4ed31]/50 transition"
              aria-label="Upload images"
            >
              <Icons.Image size={32} className="mx-auto mb-2 text-white/60" />
              <p className="text-sm text-white/80">
                {images.length > 0
                  ? "Add more photos"
                  : "Add photos (up to 10)"}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Max 10MB per image
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Image file input"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags-input" className="block text-sm font-medium text-white/80 mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags-input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="web3, nft, solana"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || (!content.trim() && images.length === 0)}
            className="w-full rounded-xl bg-[#d4ed31] py-3 font-semibold text-[#050207] hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

