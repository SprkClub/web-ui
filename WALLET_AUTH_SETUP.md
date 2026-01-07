# Wallet Authentication Setup Guide

This project implements a complete "Sign In with Wallet" system for Solana wallets using message signing and signature verification.

## Supported Wallets

- **Phantom** - `window.solana` with `isPhantom` flag
- **Backpack** - `window.backpack`
- **Solflare** - `window.solflare`
- **Brave Wallet** - `window.braveSolana` or `window.solana.isBraveWallet`

## Architecture

### Flow

1. **User clicks wallet button** → Wallet connects and returns public key
2. **Backend generates nonce** → Unique message to sign (prevents replay attacks)
3. **User signs nonce** → Wallet signs the message cryptographically
4. **Backend verifies signature** → Uses Ed25519 verification (Solana's signature algorithm)
5. **Session created** → JWT token stored in HTTP-only cookie
6. **User redirected** → To protected dashboard page

### Components

#### 1. Web3 Utilities (`src/lib/solanaWallets.js`)

- `getAvailableWallets()` - Detects installed wallets
- `connectWallet(walletName)` - Connects to wallet and returns public key
- `signMessage(walletName, message, publicKey)` - Signs a message with the wallet

#### 2. Login UI (`src/app/(auth)/wallet-login/WalletLogin.jsx`)

- Shows buttons for each available wallet
- Handles the complete login flow
- Shows loading states and error messages
- Redirects to install page if wallet not found

#### 3. API Routes

- **`POST /api/auth/nonce`** - Generates a unique nonce for signing
- **`POST /api/auth/verify`** - Verifies signature and creates session
- **`GET /api/auth/me`** - Returns current authenticated user
- **`POST /api/auth/logout`** - Clears authentication cookie

#### 4. Hooks

- **`useCurrentUser()`** - Fetches current user from API, provides `user`, `loading`, `error`, `isAuthenticated`

#### 5. Protected Pages

- **`/dashboard`** - Example protected page that requires authentication

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# JWT Secret for signing tokens (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Node environment
NODE_ENV=production
```

**Important:** In production, use a strong, random JWT secret. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Dependencies

The following packages are required (already installed):

- `@solana/web3.js` - Solana blockchain SDK
- `jsonwebtoken` - JWT token creation and verification
- `tweetnacl` - Ed25519 signature verification (Solana uses Ed25519)
- `bs58` - Base58 encoding/decoding for Solana addresses

## Usage

### 1. Login Flow

Navigate to `/wallet-login` and click on a wallet button. The system will:

1. Detect if the wallet is installed
2. Connect to the wallet
3. Request a nonce from the backend
4. Sign the nonce with your wallet
5. Verify the signature on the backend
6. Create a session and redirect to dashboard

### 2. Using Authentication in Components

```jsx
import { useCurrentUser } from "@/lib/useCurrentUser";

function MyComponent() {
  const { user, loading, isAuthenticated } = useCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Hello, {user.walletAddress}!</div>;
}
```

### 3. Protecting Pages

```jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/wallet-login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### 4. Logout

```jsx
const handleLogout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  router.push("/wallet-login");
};
```

## Security Considerations

1. **Nonce Expiration**: Nonces expire after 5 minutes to prevent replay attacks
2. **One-time Use**: Nonces are deleted after successful verification
3. **HTTP-only Cookies**: JWT tokens are stored in HTTP-only cookies (not accessible via JavaScript)
4. **Signature Verification**: Uses Ed25519 cryptographic verification (Solana's standard)
5. **Secure Cookies**: In production, cookies are marked as `secure` (HTTPS only)

## Production Checklist

- [ ] Set a strong `JWT_SECRET` environment variable
- [ ] Use HTTPS (required for secure cookies)
- [ ] Replace in-memory stores with Redis or database
- [ ] Add rate limiting to API routes
- [ ] Add CORS configuration if needed
- [ ] Set up proper error logging
- [ ] Add monitoring and analytics

## Troubleshooting

### Wallet Not Detected

- Make sure the wallet extension is installed and enabled
- Refresh the page after installing a wallet
- Check browser console for errors

### Connection Fails

- Ensure the wallet is unlocked
- Check if the wallet popup was blocked
- Verify the wallet extension is up to date

### Signature Verification Fails

- Ensure the nonce hasn't expired (5 minutes)
- Check that the message format matches between client and server
- Verify the wallet is using the correct public key

### Session Not Persisting

- Check that cookies are enabled in the browser
- Verify `credentials: "include"` is set in fetch requests
- Check browser console for cookie-related errors

## API Reference

### POST /api/auth/nonce

**Request:**
```json
{
  "walletAddress": "string",
  "walletType": "phantom" | "backpack" | "solflare" | "brave"
}
```

**Response:**
```json
{
  "nonce": "Sign in to SparksClub\n\nNonce: {hex_string}",
  "expiresIn": 300
}
```

### POST /api/auth/verify

**Request:**
```json
{
  "walletAddress": "string",
  "walletType": "phantom" | "backpack" | "solflare" | "brave",
  "nonce": "string",
  "signature": "base64_string"
}
```

**Response:**
```json
{
  "user": {
    "walletAddress": "string",
    "walletType": "string"
  },
  "token": "jwt_token_string"
}
```

### GET /api/auth/me

**Response:**
```json
{
  "user": {
    "walletAddress": "string",
    "walletType": "string"
  }
}
```

### POST /api/auth/logout

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

