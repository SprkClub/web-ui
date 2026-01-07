"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState, useCallback } from "react";

export function usePrivyAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout: privyLogout,
    linkTwitter,
    linkWallet,
  } = usePrivy();

  const { wallets } = useWallets();
  const [isSyncing, setIsSyncing] = useState(false);
  const [creatorStatus, setCreatorStatus] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [creatorStatusChecked, setCreatorStatusChecked] = useState(false);

  // Fetch creator status
  const fetchCreatorStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/creator/apply", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setIsCreator(data.isCreator || false);
        setCreatorStatus(data.creatorStatus || null);
        setHasPendingApplication(data.application?.status === 'pending');
      }
    } catch (error) {
      console.error("Error fetching creator status:", error);
    } finally {
      setCreatorStatusChecked(true);
    }
  }, []);

  // Sync Privy user with our MongoDB backend
  useEffect(() => {
    if (authenticated && user && !isSyncing) {
      syncUserWithBackend();
    }
  }, [authenticated, user]);

  // Fetch creator status after authentication
  useEffect(() => {
    if (authenticated && !isSyncing) {
      fetchCreatorStatus();
    } else if (!authenticated) {
      setIsCreator(false);
      setCreatorStatus(null);
      setHasPendingApplication(false);
      setCreatorStatusChecked(false);
    }
  }, [authenticated, isSyncing, fetchCreatorStatus]);

  const syncUserWithBackend = async () => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const response = await fetch("/api/auth/privy-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          privyId: user.id,
          twitter: user.twitter ? {
            id: user.twitter.subject,
            username: user.twitter.username,
            name: user.twitter.name,
            profileImage: user.twitter.profilePictureUrl,
          } : null,
          wallet: user.wallet ? {
            address: user.wallet.address,
            type: user.wallet.walletClientType || "unknown",
          } : null,
          email: user.email?.address,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user with backend");
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Logout from Privy
      await privyLogout();

      // Clear backend session
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("twitter_user");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get primary wallet
  const primaryWallet = wallets?.[0];

  // Get user display info
  const displayName = user?.twitter?.name ||
    user?.twitter?.username ||
    (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : null);

  const username = user?.twitter?.username;
  const profileImage = user?.twitter?.profilePictureUrl;
  const walletAddress = user?.wallet?.address || primaryWallet?.address;

  return {
    ready,
    isAuthenticated: authenticated,
    user,
    displayName,
    username,
    profileImage,
    walletAddress,
    primaryWallet,
    login,
    logout: handleLogout,
    linkTwitter,
    linkWallet,
    isSyncing,
    isCreator,
    creatorStatus,
    creatorStatusChecked,
    hasPendingApplication,
    refreshCreatorStatus: fetchCreatorStatus,
  };
}
