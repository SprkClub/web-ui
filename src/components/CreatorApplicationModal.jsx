"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";

const CATEGORIES = [
  "Artist",
  "Musician",
  "Content Creator",
  "Developer",
  "Influencer",
  "Educator",
  "Trader",
  "Other"
];

const SOCIAL_PLATFORMS = [
  { id: "twitter", label: "Twitter/X", placeholder: "https://twitter.com/username" },
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { id: "discord", label: "Discord", placeholder: "https://discord.gg/invite" },
  { id: "telegram", label: "Telegram", placeholder: "https://t.me/username" },
  { id: "website", label: "Website", placeholder: "https://yourwebsite.com" },
];

export default function CreatorApplicationModal({ isOpen, onClose }) {
  const { displayName: userName, username, refreshCreatorStatus } = usePrivyAuth();
  const [displayName, setDisplayName] = useState(userName || "");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [socialLinks, setSocialLinks] = useState([{ platform: "", url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addSocialLink = () => {
    if (socialLinks.length < 7) {
      setSocialLinks([...socialLinks, { platform: "", url: "" }]);
    }
  };

  const removeSocialLink = (index) => {
    if (socialLinks.length > 1) {
      setSocialLinks(socialLinks.filter((_, i) => i !== index));
    }
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    if (bio.length < 50) {
      setError("Bio must be at least 50 characters");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    // Build social links object
    const links = {};
    socialLinks.forEach(link => {
      if (link.platform && link.url.trim()) {
        links[link.platform] = link.url.trim();
      }
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/creator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          category,
          socialLinks: links
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      await refreshCreatorStatus();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-white/60">We'll review your application and get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a] z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Apply for Creator</h2>
            <p className="text-sm text-white/50">Share your profile to become a verified creator</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-white/80 mb-2">
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your creator name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
              maxLength={50}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white/80 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#d4ed31]/50 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0a0a0a]">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-2">
              Bio * <span className="text-white/40">(min 50 characters)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and why you want to become a creator..."
              className="w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none resize-none"
              maxLength={1000}
            />
            <p className={`text-xs mt-1 ${bio.length < 50 ? 'text-orange-400' : 'text-white/40'}`}>
              {bio.length}/1000 {bio.length < 50 && `(${50 - bio.length} more needed)`}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/80">
                Social Links
              </label>
              {socialLinks.length < 7 && (
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="text-xs text-[#d4ed31] hover:text-[#eaff5f] transition"
                >
                  + Add another
                </button>
              )}
            </div>
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white text-sm focus:border-[#d4ed31]/50 focus:outline-none appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a]">Platform</option>
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0a0a0a]">{p.label}</option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.placeholder || "https://..."}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
                  />
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 rounded-xl border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition"
                    >
                      <Icons.Close size={16} className="text-white/50" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current X Handle */}
          {username && (
            <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 rounded-xl p-3 border border-white/10">
              <Icons.Twitter size={16} />
              <span>Logged in as @{username}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#d4ed31] py-3 font-semibold text-[#050207] hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>

          <p className="text-xs text-white/40 text-center">
            By submitting, you agree to our terms and conditions. Applications are typically reviewed within 24-48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
