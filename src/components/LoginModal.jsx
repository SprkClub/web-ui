"use client";

import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";

export default function LoginModal({ isOpen, onClose }) {
  const { login, ready } = usePrivyAuth();

  if (!isOpen) return null;

  const handleLogin = () => {
    login();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 sm:right-6 top-4 sm:top-6 text-white/60 hover:text-white transition z-10"
          aria-label="Close modal"
        >
          <Icons.Close size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to SparksClub</h2>
          <p className="text-white/50 text-sm">Connect with X to continue</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={!ready}
          className="w-full flex items-center justify-center gap-3 rounded-xl sm:rounded-2xl bg-white px-4 py-4 text-base font-semibold text-black hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icons.Twitter size={22} className="text-black" />
          <span>Continue with X</span>
        </button>

        <p className="text-xs text-white/40 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
