"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function WalletConnectButton({
  onConnect,
  className = "",
  variant = "primary", // "primary" | "secondary" | "outline"
  size = "md", // "sm" | "md" | "lg"
  showAddress = true,
}) {
  const { ready, authenticated, login, linkWallet } = usePrivy();
  const { wallets } = useWallets();
  const [isConnecting, setIsConnecting] = useState(false);

  const primaryWallet = wallets?.[0];
  const walletAddress = primaryWallet?.address;
  const isConnected = !!walletAddress;

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    if (!ready) return;

    setIsConnecting(true);
    try {
      if (!authenticated) {
        // Need to login first
        await login();
      } else if (!walletAddress) {
        // Authenticated but no wallet, link one
        await linkWallet();
      }

      // Call onConnect callback if provided
      if (onConnect && walletAddress) {
        onConnect(walletAddress);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: isConnected
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f]",
    secondary: isConnected
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-white/10 text-white border border-white/20 hover:bg-white/20",
    outline: isConnected
      ? "bg-green-500/10 text-green-400 border border-green-500/30"
      : "bg-transparent text-white border border-white/30 hover:border-white/50 hover:bg-white/5",
  };

  return (
    <button
      onClick={handleConnect}
      disabled={!ready || isConnecting}
      className={`
        flex items-center justify-center gap-2 rounded-xl font-semibold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {showAddress && <span>{formatAddress(walletAddress)}</span>}
          {!showAddress && <span>Connected</span>}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}

// Wallet display component for showing connected wallet info
export function WalletDisplay({ address, onDisconnect }) {
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  if (!address) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4ed31]/30 to-purple-500/30 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#d4ed31]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50">Connected Wallet</p>
        <p className="text-sm font-mono text-white truncate">{formatAddress(address)}</p>
      </div>
      <button
        onClick={copyAddress}
        className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/50 hover:text-white"
        title="Copy address"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      </button>
    </div>
  );
}
