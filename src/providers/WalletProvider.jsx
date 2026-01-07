"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * WalletProvider Component
 * 
 * Provides Solana wallet adapter context to the application.
 * Follows the official Solana cookbook pattern:
 * https://solana.com/developers/cookbook/wallets/connect-wallet-react
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export default function WalletProvider({ children }) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  // Using Mainnet for production
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint
  // For production, consider using a custom RPC endpoint for better performance
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize wallet adapters
  // The SDK will automatically detect which wallets are installed
  // Note: Backpack and Brave may need separate adapter packages
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add more adapters here as needed
      // Backpack and Brave may require separate packages
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

