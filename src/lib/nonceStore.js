/**
 * Shared Nonce Store
 * 
 * This module provides a shared in-memory store for nonces across all API routes.
 * In production, this should be replaced with Redis or a database.
 */

// In-memory store for nonces
// Format: { walletAddress: { nonce: string, expiresAt: number, walletType: string } }
// Use a global to ensure it's truly shared across all module instances
let _nonceStore = null;

if (typeof globalThis !== "undefined") {
  // Use globalThis to ensure the store persists across module reloads in development
  if (!globalThis.__nonceStore) {
    globalThis.__nonceStore = new Map();
    console.log("[nonceStore] Initialized new global nonce store");
  }
  _nonceStore = globalThis.__nonceStore;
} else {
  _nonceStore = new Map();
}

export const nonceStore = _nonceStore;

// Clean up expired nonces every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [address, data] of nonceStore.entries()) {
      if (data.expiresAt < now) {
        nonceStore.delete(address);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[nonceStore] Cleaned up ${cleaned} expired nonces`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Get stored nonce for a wallet address
 * @param {string} walletAddress - The wallet address
 * @returns {Object|null} The stored nonce data or null if not found/expired
 */
export function getStoredNonce(walletAddress) {
  // Normalize address for consistent lookup
  const normalizedAddress = walletAddress?.trim();
  if (!normalizedAddress) {
    return null;
  }
  
  const data = nonceStore.get(normalizedAddress);
  if (!data) {
    return null;
  }

  // Check if expired
  if (data.expiresAt < Date.now()) {
    nonceStore.delete(normalizedAddress);
    return null;
  }

  return data;
}

/**
 * Delete a nonce after successful verification (to prevent reuse)
 * @param {string} walletAddress - The wallet address
 */
export function deleteNonce(walletAddress) {
  const normalizedAddress = walletAddress?.trim();
  if (normalizedAddress) {
    nonceStore.delete(normalizedAddress);
  }
}

