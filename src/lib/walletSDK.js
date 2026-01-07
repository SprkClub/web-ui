/**
 * Wallet SDK Utilities
 * 
 * This module provides utilities for working with Solana wallets using the
 * Solana Wallet Adapter SDK. It provides a standardized interface for
 * connecting wallets and signing messages.
 */

import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Gets the wallet adapter name from wallet type string
 * @param {string} walletType - The wallet type ("phantom", "backpack", etc.)
 * @returns {string} The adapter name
 */
export function getAdapterName(walletType) {
  const mapping = {
    phantom: "Phantom",
    backpack: "Backpack",
    solflare: "Solflare",
    brave: "Brave Wallet",
  };
  return mapping[walletType] || walletType;
}

/**
 * Hook to connect and sign with a specific wallet using the SDK
 * @param {string} walletType - The wallet type to use
 * @returns {Object} Wallet connection and signing utilities
 */
export function useWalletSDK(walletType) {
  const {
    publicKey,
    wallet,
    connect,
    disconnect,
    connected,
    select,
    wallets,
    signMessage,
  } = useWallet();

  /**
   * Connect to a specific wallet
   */
  const connectWallet = async () => {
    if (!wallets || wallets.length === 0) {
      throw new Error("No wallets available");
    }

    const adapterName = getAdapterName(walletType);
    const targetWallet = wallets.find(
      (w) => w.adapter.name === adapterName
    );

    if (!targetWallet) {
      throw new Error(
        `${adapterName} wallet adapter not found. Please make sure the wallet extension is installed.`
      );
    }

    // Select the wallet if not already selected
    if (wallet?.adapter.name !== adapterName) {
      await select(adapterName);
      // Wait a bit for selection to complete
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Connect if not already connected
    if (!connected || !publicKey) {
      await connect();
      // Wait for connection to complete
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!publicKey) {
      throw new Error("Failed to connect to wallet");
    }

    return {
      publicKey: publicKey.toString(),
      wallet: wallet?.adapter.name,
    };
  };

  /**
   * Sign a message using the connected wallet
   */
  const signMessageWithWallet = async (message) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet is not connected");
    }

    if (!signMessage) {
      throw new Error("Wallet does not support message signing");
    }

    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);

    // Sign the message
    const signature = await signMessage(messageBytes);

    return signature;
  };

  /**
   * Check if a specific wallet is available
   */
  const isWalletAvailable = () => {
    if (!wallets || wallets.length === 0) return false;
    const adapterName = getAdapterName(walletType);
    return wallets.some((w) => w.adapter.name === adapterName);
  };

  return {
    publicKey: publicKey?.toString(),
    wallet: wallet?.adapter.name,
    connected,
    connectWallet,
    signMessageWithWallet,
    isWalletAvailable,
    disconnect,
    wallets,
  };
}

