/**
 * Solana Wallet Utilities
 * 
 * This module provides utilities for detecting and connecting to Solana wallet browser extensions.
 * It works directly with the window providers exposed by wallet extensions (e.g., window.solana, window.backpack).
 * 
 * Supported wallets:
 * - Phantom (window.solana with isPhantom flag)
 * - Backpack (window.backpack)
 * - Solflare (window.solflare)
 * - Brave (window.braveSolana)
 */

/**
 * @typedef {("phantom" | "backpack" | "solflare" | "brave")} WalletType
 */

/**
 * Wallet detection and connection utilities
 */

/**
 * Detects which Solana wallets are installed in the browser
 * @returns {Object} Object with wallet names as keys and boolean values indicating installation status
 */
export function getAvailableWallets() {
  if (typeof window === "undefined") {
    return {
      phantom: false,
      backpack: false,
      solflare: false,
      brave: false,
    };
  }

  return {
    phantom: !!(window.solana && window.solana.isPhantom),
    backpack: !!window.backpack,
    solflare: !!window.solflare,
    brave: !!(window.braveSolana || (window.solana && window.solana.isBraveWallet)),
  };
}

/**
 * Gets the wallet provider object for a specific wallet type
 * @param {WalletType} walletName - The wallet type to get the provider for
 * @returns {Object|null} The wallet provider object or null if not found
 */
function getWalletProvider(walletName) {
  if (typeof window === "undefined") return null;

  switch (walletName) {
    case "phantom":
      return window.solana?.isPhantom ? window.solana : null;
    case "backpack":
      return window.backpack || null;
    case "solflare":
      return window.solflare || null;
    case "brave":
      return window.braveSolana || (window.solana?.isBraveWallet ? window.solana : null);
    default:
      return null;
  }
}

/**
 * Connects to a Solana wallet and returns the public key
 * @param {WalletType} walletName - The wallet type to connect to
 * @returns {Promise<{publicKey: string, provider: Object}>} Object containing the public key and provider
 * @throws {Error} If wallet is not installed or connection fails
 */
export async function connectWallet(walletName) {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in the browser");
  }

  console.log(`[connectWallet] Attempting to connect to ${walletName}...`);
  console.log(`[connectWallet] Window object check:`, {
    hasWindow: typeof window !== "undefined",
    hasSolana: !!window.solana,
    solanaIsPhantom: !!(window.solana?.isPhantom),
    hasBackpack: !!window.backpack,
    hasSolflare: !!window.solflare,
    hasBraveSolana: !!window.braveSolana,
  });

  const provider = getWalletProvider(walletName);

  if (!provider) {
    console.error(`[connectWallet] Provider not found for ${walletName}`);
    const walletLinks = {
      phantom: "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
      backpack: "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
      solflare: "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadbnfckgkcopagkgchj",
      brave: "https://brave.com/wallet",
    };

    throw new Error(
      `${walletName.charAt(0).toUpperCase() + walletName.slice(1)} wallet is not installed. ` +
      `Please install it from: ${walletLinks[walletName] || "the Chrome Web Store"}`
    );
  }

  console.log(`[connectWallet] Provider found for ${walletName}:`, {
    hasConnect: typeof provider.connect === "function",
    hasRequest: typeof provider.request === "function",
    isConnected: provider.isConnected,
    hasPublicKey: !!provider.publicKey,
  });

  try {
    // Check if already connected
    if (provider.isConnected && provider.publicKey) {
      console.log("Wallet already connected:", walletName);
      const publicKeyString = typeof provider.publicKey === "string" 
        ? provider.publicKey 
        : provider.publicKey.toString();
      return {
        publicKey: publicKeyString,
        provider,
      };
    }

    // Connect to the wallet
    // Different wallets use different APIs
    let response;
    
    if (walletName === "phantom") {
      // Phantom uses connect() with optional onlyIfTrusted flag
      // Set onlyIfTrusted: false to always show popup
      console.log("[connectWallet] Calling Phantom connect()...");
      
      // Wait for Phantom to be ready if needed
      if (provider.isPhantom && !provider.isConnected) {
        // Phantom is ready, proceed with connection
        console.log("[connectWallet] Phantom is ready, connecting...");
      }
      
      // Call connect - this should trigger the popup
      response = await provider.connect({ onlyIfTrusted: false });
      console.log("[connectWallet] Phantom connect() response:", response);
    } else if (provider.connect) {
      // Most other wallets use connect()
      console.log(`Calling ${walletName} connect()...`);
      response = await provider.connect();
    } else if (provider.request) {
      // Some wallets use request() method
      console.log(`Calling ${walletName} request(connect)...`);
      response = await provider.request({ method: "connect" });
    } else {
      throw new Error("Wallet provider does not support connection");
    }

    console.log("Connection response:", response);

    // Extract public key from response
    // Some wallets return { publicKey }, others set it on the provider
    let publicKey = response?.publicKey || provider.publicKey;

    // Wait a bit for provider state to update if needed
    if (!publicKey) {
      await new Promise(resolve => setTimeout(resolve, 100));
      publicKey = provider.publicKey;
    }

    if (!publicKey) {
      throw new Error("Failed to get public key from wallet");
    }

    // Convert PublicKey object to string if needed
    const publicKeyString = typeof publicKey === "string" 
      ? publicKey 
      : publicKey.toString();

    console.log("Successfully connected! Public key:", publicKeyString);

    return {
      publicKey: publicKeyString,
      provider,
    };
  } catch (error) {
    // Handle user rejection
    if (
      error?.code === 4001 ||
      error?.message?.includes("User rejected") ||
      error?.message?.includes("denied") ||
      error?.message?.includes("cancelled")
    ) {
      throw new Error("Connection cancelled by user");
    }

    // Re-throw other errors
    throw new Error(`Failed to connect to ${walletName}: ${error.message || error}`);
  }
}

/**
 * Signs a message using the specified wallet
 * @param {WalletType} walletName - The wallet type to use for signing
 * @param {string} message - The message to sign (will be converted to Uint8Array)
 * @param {string} publicKey - The public key of the wallet (for verification)
 * @returns {Promise<{signature: Uint8Array, publicKey: string}>} Object containing the signature and public key
 * @throws {Error} If wallet is not installed, not connected, or signing fails
 */
export async function signMessage(walletName, message, publicKey) {
  if (typeof window === "undefined") {
    throw new Error("Message signing is only available in the browser");
  }

  const provider = getWalletProvider(walletName);

  if (!provider) {
    throw new Error(`${walletName} wallet is not installed`);
  }

  // Convert message to Uint8Array
  // Solana wallets typically expect the message as Uint8Array
  const messageBytes = new TextEncoder().encode(message);

  try {
    // Sign the message
    // Most wallets use signMessage() method that takes { message: Uint8Array }
    let signature;

    if (provider.signMessage) {
      const response = await provider.signMessage(messageBytes);
      signature = response.signature || response;
    } else if (provider.sign) {
      // Alternative API
      signature = await provider.sign(messageBytes);
    } else if (provider.request) {
      // Some wallets use request() method
      const response = await provider.request({
        method: "signMessage",
        params: {
          message: messageBytes,
        },
      });
      signature = response.signature || response;
    } else {
      throw new Error("Wallet provider does not support message signing");
    }

    // Ensure signature is Uint8Array
    if (!(signature instanceof Uint8Array)) {
      if (Array.isArray(signature)) {
        signature = new Uint8Array(signature);
      } else if (typeof signature === "string") {
        // If signature is base58 encoded string, decode it
        // Note: We'll handle base58 decoding in the API route if needed
        // For now, convert string to Uint8Array if it's hex
        try {
          signature = new Uint8Array(
            signature.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
          );
        } catch {
          throw new Error("Invalid signature format from wallet");
        }
      } else {
        throw new Error("Invalid signature format from wallet");
      }
    }

    return {
      signature,
      publicKey: publicKey || (provider.publicKey?.toString() || ""),
    };
  } catch (error) {
    // Handle user rejection
    if (
      error?.code === 4001 ||
      error?.message?.includes("User rejected") ||
      error?.message?.includes("denied") ||
      error?.message?.includes("cancelled")
    ) {
      throw new Error("Signing cancelled by user");
    }

    // Re-throw other errors
    throw new Error(`Failed to sign message: ${error.message || error}`);
  }
}

/**
 * Disconnects from a wallet
 * @param {WalletType} walletName - The wallet type to disconnect from
 * @returns {Promise<void>}
 */
export async function disconnectWallet(walletName) {
  if (typeof window === "undefined") return;

  const provider = getWalletProvider(walletName);

  if (provider && provider.disconnect) {
    try {
      await provider.disconnect();
    } catch (error) {
      console.error(`Error disconnecting ${walletName}:`, error);
    }
  }
}

