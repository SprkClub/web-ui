"use client";

/**
 * Wallet Login Component
 *
 * This component provides a "Sign In with Wallet" experience:
 * 1. User clicks a wallet button
 * 2. Wallet connects and gets public key
 * 3. Backend generates a nonce to sign
 * 4. User signs the nonce with their wallet
 * 5. Backend verifies signature and creates a session
 * 6. User is redirected to dashboard
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  getAvailableWallets,
  connectWallet,
  signMessage,
} from "@/lib/solanaWallets";

/**
 * @typedef {("phantom" | "backpack" | "solflare" | "brave")} WalletType
 */

export default function WalletLogin() {
  const router = useRouter();
  const [availableWallets, setAvailableWallets] = useState({
    phantom: false,
    backpack: false,
    solflare: false,
    brave: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);

  // Detect available wallets on mount
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  /**
   * Handles the complete wallet login flow
   * @param {WalletType} walletType - The wallet type to connect with
   */
  const handleWalletLogin = async (walletType) => {
    setLoading(true);
    setError(null);
    setConnectedWallet(null);

    try {
      // Step 1: Connect to wallet and get public key
      console.log(`[WalletLogin] Starting connection to ${walletType}...`);
      console.log(`[WalletLogin] Available wallets:`, availableWallets);
      
      const { publicKey } = await connectWallet(walletType);
      console.log("[WalletLogin] Connected! Public key:", publicKey);

      setConnectedWallet({ type: walletType, address: publicKey });

      // Step 2: Request a nonce from the backend
      console.log("Requesting nonce from backend...");
      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          walletType: walletType,
        }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.error || "Failed to get nonce");
      }

      const { nonce } = await nonceResponse.json();
      console.log("Received nonce:", nonce);

      // Step 3: Sign the nonce with the wallet
      console.log("Signing nonce...");
      const { signature } = await signMessage(walletType, nonce, publicKey);

      // Convert signature to base64 for transmission
      // Convert Uint8Array to base64 string
      const signatureBase64 = btoa(
        String.fromCharCode.apply(null, Array.from(signature))
      );

      // Step 4: Send signature to backend for verification
      console.log("Verifying signature...");
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          walletType: walletType,
          nonce: nonce,
          signature: signatureBase64,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Signature verification failed");
      }

      const userData = await verifyResponse.json();
      console.log("Login successful!", userData);

      // Step 5: Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("[WalletLogin] Wallet login error:", err);
      console.error("[WalletLogin] Error details:", {
        message: err.message,
        stack: err.stack,
        walletType,
      });
      setError(err.message || "Failed to login with wallet");
      setConnectedWallet(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets the display name for a wallet
   */
  const getWalletDisplayName = (walletType) => {
    const names = {
      phantom: "Phantom",
      backpack: "Backpack",
      solflare: "Solflare",
      brave: "Brave Wallet",
    };
    return names[walletType] || walletType;
  };

  /**
   * Gets the install link for a wallet
   */
  const getWalletInstallLink = (walletType) => {
    const links = {
      phantom:
        "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
      backpack:
        "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
      solflare:
        "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadbnfckgkcopagkgchj",
      brave: "https://brave.com/wallet",
    };
    return links[walletType];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050207] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f0a15] border border-[#1a1a1a] rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-[#d4ed31] mb-2 text-center">
            Sign In with Wallet
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Connect your Solana wallet to continue
          </p>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-3 bg-gray-900 rounded text-xs text-gray-400">
              <p className="font-semibold mb-1">Detected Wallets:</p>
              <ul className="space-y-1">
                {Object.entries(availableWallets).map(([name, isAvailable]) => (
                  <li key={name} className="flex items-center gap-2">
                    {isAvailable ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                    {name}: {isAvailable ? "Installed" : "Not installed"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {connectedWallet && !error && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">
                Connected: {connectedWallet.address.slice(0, 8)}...
                {connectedWallet.address.slice(-8)}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {(["phantom", "backpack", "solflare", "brave"]).map((walletType) => {
              const isAvailable = availableWallets[walletType];
              const isConnecting = loading && connectedWallet?.type === walletType;

              return (
                <button
                  key={walletType}
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log(`[WalletLogin] Button clicked for ${walletType}`, {
                      isAvailable,
                      loading,
                    });
                    
                    if (loading) {
                      console.log("[WalletLogin] Already loading, ignoring click");
                      return;
                    }
                    
                    if (isAvailable) {
                      console.log(`[WalletLogin] Starting login for ${walletType}`);
                      await handleWalletLogin(walletType);
                    } else {
                      console.log(`[WalletLogin] Opening install link for ${walletType}`);
                      window.open(getWalletInstallLink(walletType), "_blank");
                    }
                  }}
                  disabled={loading}
                  className={`
                    w-full py-4 px-6 rounded-lg font-medium transition-all
                    ${
                      isAvailable
                        ? "bg-[#d4ed31] text-[#050207] hover:bg-[#c4dd21] active:scale-95"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    ${isConnecting ? "animate-pulse" : ""}
                  `}
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : isAvailable ? (
                    `Connect ${getWalletDisplayName(walletType)}`
                  ) : (
                    `Install ${getWalletDisplayName(walletType)}`
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

