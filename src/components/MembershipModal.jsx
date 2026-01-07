"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useWallet } from "@solana/wallet-adapter-react";

const membershipTiers = [
  {
    id: "bronze",
    name: "Bronze",
    price: "0.1 SOL",
    solPrice: 0.1,
    features: [
      "Bronze badge on profile",
      "Access to exclusive content",
      "Priority support",
      "Early access to features",
    ],
    color: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/50",
    badgeColor: "bg-orange-500",
  },
  {
    id: "silver",
    name: "Silver",
    price: "0.5 SOL",
    solPrice: 0.5,
    features: [
      "Silver badge on profile",
      "All Bronze features",
      "Exclusive NFT airdrops",
      "Creator revenue share",
      "Custom profile theme",
    ],
    color: "from-gray-400/20 to-gray-500/20",
    borderColor: "border-gray-400/50",
    badgeColor: "bg-gray-400",
    popular: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: "1 SOL",
    solPrice: 1,
    features: [
      "Gold badge on profile",
      "All Silver features",
      "VIP events access",
      "1-on-1 creator sessions",
      "Platform governance voting",
      "Revenue share boost",
    ],
    color: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/50",
    badgeColor: "bg-yellow-500",
  },
];

export default function MembershipModal({ isOpen, onClose }) {
  const { user } = useCurrentUser();
  const { publicKey, sendTransaction } = useWallet();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (tier) => {
    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }

    setIsProcessing(true);
    try {
      // Here you would integrate with your payment API
      // For now, this is a placeholder
      const response = await fetch("/api/membership/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tier: tier.id,
          solAmount: tier.solPrice,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully purchased ${tier.name} membership!`);
        onClose();
        window.location.reload();
      } else {
        alert(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Error purchasing membership:", error);
      alert("Failed to process purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0a0a0a]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Choose Your Membership
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Unlock exclusive features and support creators
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Membership Tiers */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-2xl border-2 p-6 bg-gradient-to-br ${tier.color} ${tier.borderColor} ${
                  tier.popular ? "ring-2 ring-[#d4ed31] ring-offset-2 ring-offset-[#0a0a0a]" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#d4ed31] text-[#050207] text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${tier.badgeColor} flex items-center justify-center mb-4`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {tier.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-sm text-white/60 ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-[#d4ed31] flex-shrink-0 mt-0.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(tier)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    tier.popular
                      ? "bg-[#d4ed31] text-[#050207] hover:bg-[#eaff5f]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? "Processing..." : `Subscribe ${tier.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Current Membership */}
          {user?.membership && (
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60">
                Current membership:{" "}
                <span className="font-semibold text-white capitalize">
                  {user.membership.tier}
                </span>
              </p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-[#d4ed31]/10 border border-[#d4ed31]/30">
            <p className="text-xs sm:text-sm text-white/80">
              💡 Memberships are paid monthly in SOL. Cancel anytime. All
              payments support the platform and creators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

