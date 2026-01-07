"use client";

import { useState, useRef, useEffect } from "react";

export default function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [displayName, setDisplayName] = useState(userData?.displayName || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [tempCoverImage, setTempCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const modalRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(userData?.displayName || "");
      setBio(userData?.bio || "");
      setTempProfileImage(null);
      setTempCoverImage(null);
    }
  }, [isOpen, userData]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        displayName,
        bio,
        profileImage: tempProfileImage,
        coverImage: tempCoverImage,
      });
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Cover Image</label>
            <div
              className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-r from-[#d4ed31]/20 to-purple-500/20 cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {tempCoverImage ? (
                <img src={tempCoverImage} alt="" className="w-full h-full object-cover" />
              ) : userData?.coverImage ? (
                <img src={userData.coverImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#d4ed31]/30 via-purple-500/30 to-pink-500/30" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setTempCoverImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-[#d4ed31]/20 cursor-pointer group"
                onClick={() => profileInputRef.current?.click()}
              >
                {tempProfileImage ? (
                  <img src={tempProfileImage} alt="" className="w-full h-full object-cover" />
                ) : userData?.profileImage ? (
                  <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#d4ed31]">
                      {userData?.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTempProfileImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              <p className="text-sm text-white/50">Click to upload a new profile picture</p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#d4ed31]/50 transition"
            />
          </div>

          {/* Username (Not editable) */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Username
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-white/10 text-white/40 rounded">Not editable</span>
            </label>
            <input
              type="text"
              value={`@${userData?.username || ""}`}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
            />
          </div>

          {/* Token Ticker (Not editable) - Only show for creators */}
          {userData?.tokenTicker && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Token Ticker
                <span className="ml-2 px-2 py-0.5 text-[10px] bg-white/10 text-white/40 rounded">Not editable</span>
              </label>
              <input
                type="text"
                value={userData.tokenTicker}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
              />
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-[#d4ed31]/50 transition"
            />
            <p className="text-xs text-white/40 mt-1">{bio.length}/160 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl font-semibold bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
