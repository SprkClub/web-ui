"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export default function PrivyProvider({ children }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn("Privy App ID not configured");
    return <>{children}</>;
  }

  return (
    <Privy
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#d4ed31",
          logo: "/logo.png",
          showWalletLoginFirst: false,
        },
        // Mandatory X (Twitter) authentication only
        loginMethods: ["twitter"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        solanaClusters: [
          { name: "mainnet-beta", rpcUrl: "https://api.mainnet-beta.solana.com" },
        ],
      }}
    >
      {children}
    </Privy>
  );
}
