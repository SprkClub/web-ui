"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  VersionedTransaction,
  TransactionMessage,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";
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

export default function CreateCoinPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useCurrentUser();
  const { openModal } = useLoginModal();
  const { publicKey, signTransaction, connected } = useWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Form state
  const [coinName, setCoinName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [mayhemMode, setMayhemMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    // TODO: Implement actual image upload to IPFS or your storage
    // For now, return a placeholder URI
    return "https://ipfs.erebrus.io/ipfs/Qmb3bh6GvkPtd14oTxQE65j1wqZyJempbEZd3XYxc55Hfd";
  };

  const handleCreateCoin = async () => {
    if (!coinName || !ticker) {
      setError("Coin name and ticker are required");
      return;
    }

    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Step 1: Upload image if provided
      let imageUri = "";
      if (imageFile) {
        imageUri = await uploadImage(imageFile);
      }

      // Step 2: Get pool instructions from API
      const response = await fetch("/api/coins/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          name: coinName,
          symbol: ticker.toUpperCase(),
          uri: imageUri || "https://ipfs.erebrus.io/ipfs/Qmb3bh6GvkPtd14oTxQE65j1wqZyJempbEZd3XYxc55Hfd",
          cluster: "MAINNET",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create coin");
      }

      const { data } = await response.json();

      // Step 3: Reconstruct baseMint keypair
      const baseMint = Keypair.fromSecretKey(
        Uint8Array.from(data.baseMint.secretKey)
      );

      // Step 4: Deserialize instructions
      const { Connection, TransactionInstruction, PublicKey, TransactionMessage } = await import("@solana/web3.js");
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

      const instructions = data.instructions.map((serialized) => {
        return new TransactionInstruction({
          programId: new PublicKey(serialized.programId),
          keys: serialized.keys.map((key) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
          data: Buffer.from(serialized.data),
        });
      });

      // Step 5: Build versioned transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: instructions,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(messageV0);

      // Step 6: Sign transaction
      // Note: We need to sign with both the wallet and baseMint
      // The wallet adapter can sign the transaction, but we also need baseMint signature
      // This is a simplified version - in production, you may need to handle this differently
      
      // For now, we'll need to use a different approach since we can't sign with baseMint in the browser
      // This would typically require a backend service to handle the signing
      
      setError("Coin creation requires backend signing. Please implement server-side transaction signing.");
      
      // TODO: Implement proper transaction signing flow
      // Option 1: Send to backend API that handles signing
      // Option 2: Use a signing service
      // Option 3: Implement client-side signing if possible

    } catch (err) {
      console.error("Error creating coin:", err);
      setError(err.message || "Failed to create coin. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatMarketCap = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
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

        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full max-w-4xl mx-auto">
          <SearchBar />
          
          <main className="no-scrollbar flex flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto pb-6 min-h-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Create new coin.</h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Coin details - Choose carefully, these can't be changed once the coin is created.
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Left Column - Form */}
              <div className="flex-1 space-y-4 sm:space-y-6">
                {/* Coin Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Coin name
                  </label>
                  <input
                    type="text"
                    value={coinName}
                    onChange={(e) => setCoinName(e.target.value)}
                    placeholder="Name your coin."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
                  />
                </div>

                {/* Ticker */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Ticker
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="Add a coin ticker (e.g. DOGE)."
                    maxLength={10}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none uppercase"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a short description."
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none resize-none"
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Add social links (Optional)
                  </label>
                  <input
                    type="text"
                    value={socialLinks}
                    onChange={(e) => setSocialLinks(e.target.value)}
                    placeholder="Twitter, Telegram, Website..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
                  />
                </div>

                {/* Mayhem Mode */}
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-white">
                        Mayhem mode <span className="text-[#d4ed31] text-xs">New</span>
                      </h3>
                      <p className="text-xs text-white/60">Increased price volume</p>
                    </div>
                    <button
                      onClick={() => setMayhemMode(!mayhemMode)}
                      className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0 ${
                        mayhemMode ? "bg-[#d4ed31]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          mayhemMode ? "translate-x-5 sm:translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-white/60">
                    Active for 24h, only set at creation. May increase coin supply.{" "}
                    <a href="#" className="text-[#d4ed31] hover:underline">Learn more</a>
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
                    Select video or image to upload
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center cursor-pointer hover:border-[#d4ed31]/50 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="space-y-3 sm:space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-xs sm:text-sm text-red-400 hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs sm:text-sm text-white/60 px-2">
                          Select video or image to upload or drag and drop it here.
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateCoin}
                  disabled={isCreating || !coinName || !ticker}
                  className="w-full rounded-xl sm:rounded-2xl bg-[#d4ed31] py-3 sm:py-4 font-semibold text-sm sm:text-base text-[#050207] hover:bg-[#eaff5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating coin..." : "Create coin"}
                </button>
              </div>

              {/* Right Column - Preview */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-white/60 mb-3 sm:mb-4">
                    Preview
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Coin preview"
                        className="w-full h-40 sm:h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-white/20 text-sm">No image</span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white">
                        {coinName || "Coin Name"}
                      </h4>
                      <p className="text-xs sm:text-sm text-white/60">
                        {ticker || "TICKER"}
                      </p>
                    </div>
                    {description && (
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-3">{description}</p>
                    )}
                    <div className="pt-3 sm:pt-4 border-t border-white/10">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/60">Market Cap</span>
                        <span className="text-white">$0.00</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm mt-2">
                        <span className="text-white/60">Replies</span>
                        <span className="text-white">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

