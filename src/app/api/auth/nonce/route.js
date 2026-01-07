/**
 * Nonce Generation API Route
 * 
 * This endpoint generates a unique nonce for a wallet address to prevent replay attacks.
 * The nonce is stored temporarily (in-memory) and will be verified during signature verification.
 * 
 * POST /api/auth/nonce
 * Body: { walletAddress: string, walletType: string }
 * Response: { nonce: string }
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { nonceStore } from "@/lib/nonceStore";

/**
 * Generates a random nonce string
 * @returns {string} A random 32-byte hex string
 */
function generateNonce() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request) {
  console.log("[nonce] POST /api/auth/nonce called");
  try {
    const body = await request.json();
    const { walletAddress, walletType } = body;
    
    console.log("[nonce] Request received:", {
      walletAddress: walletAddress?.substring(0, 10) + "...",
      walletType,
      storeSizeBefore: nonceStore.size,
    });

    // Validate input
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "walletAddress is required and must be a string" },
        { status: 400 }
      );
    }

    if (!walletType || typeof walletType !== "string") {
      return NextResponse.json(
        { error: "walletType is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate wallet type
    const validWalletTypes = ["phantom", "backpack", "solflare", "brave"];
    if (!validWalletTypes.includes(walletType)) {
      return NextResponse.json(
        { error: `Invalid walletType. Must be one of: ${validWalletTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Normalize wallet address (ensure consistent format)
    const normalizedAddress = walletAddress.trim();

    // Generate a new nonce (hex string)
    const nonceHex = generateNonce();

    // Create a message to sign (format: "Sign in to SparksClub\n\nNonce: {nonce}")
    // This format is common for wallet authentication
    const messageToSign = `Sign in to SparksClub\n\nNonce: ${nonceHex}`;

    // Store the FULL MESSAGE (not just the hex) with expiration (5 minutes)
    // This is what the client will sign and send back
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    console.log("[nonce] Storing nonce:", {
      address: normalizedAddress,
      addressLength: normalizedAddress.length,
      storeSizeBefore: nonceStore.size,
    });
    
    nonceStore.set(normalizedAddress, {
      nonce: messageToSign, // Store the full message that will be signed
      nonceHex: nonceHex, // Also store the hex for reference if needed
      expiresAt,
      walletType,
    });

    // Verify it was stored
    const stored = nonceStore.get(normalizedAddress);
    console.log("[nonce] Nonce stored successfully:", {
      walletAddress: normalizedAddress,
      walletAddressLength: normalizedAddress.length,
      walletType,
      expiresAt: new Date(expiresAt).toISOString(),
      storeSize: nonceStore.size,
      storeKeys: Array.from(nonceStore.keys()),
      wasStored: !!stored,
      storedNoncePreview: stored?.nonce?.substring(0, 50) + "...",
    });

    // Return the full message to sign
    return NextResponse.json({
      nonce: messageToSign, // Return the full message that should be signed
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Re-export functions from shared store for backward compatibility
export { getStoredNonce, deleteNonce } from "@/lib/nonceStore";

