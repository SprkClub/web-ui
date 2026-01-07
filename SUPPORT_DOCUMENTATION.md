# SparksClub - Support Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [API Routes](#api-routes)
5. [Components Structure](#components-structure)
6. [Configuration](#configuration)
7. [Environment Variables](#environment-variables)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Security Considerations](#security-considerations)
12. [Future Improvements](#future-improvements)

---

## Project Overview

**SparksClub** (also branded as **Trends.fun**) is a Next.js-based web application that provides real-time crypto trend tracking and social trading features. The platform allows users to:

- Track trending crypto coins and keywords
- View rankings and statistics
- Authenticate using Solana wallets or Twitter/X
- Access protected dashboard features

### Tech Stack
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **Blockchain**: Solana (via @solana/web3.js)
- **Authentication**: JWT tokens, Ed25519 signature verification
- **Wallet Integration**: Solana Wallet Adapter

---

## Architecture

### Project Structure

```
sparksclub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth-related pages
│   │   │   └── wallet-login/   # Wallet login page
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── auth/              # Auth callback pages
│   │   ├── dashboard/        # Protected dashboard
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Home page
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── providers/             # Context providers
├── public/                    # Static assets
├── package.json
├── next.config.mjs
└── .env.local                 # Environment variables (not in repo)
```

### Key Design Patterns

1. **Provider Pattern**: Wallet and LoginModal contexts wrap the application
2. **Hook-based Authentication**: Custom hooks (`useAuth`, `useCurrentUser`) manage auth state
3. **API Route Handlers**: Server-side authentication logic in `/api` routes
4. **Component Composition**: Reusable UI components with clear separation of concerns

---

## Authentication System

The application supports **two authentication methods**:

### 1. Solana Wallet Authentication

**Supported Wallets:**
- Phantom
- Solflare
- Backpack
- Brave Wallet
- Bitget Wallet

**Authentication Flow:**

```
1. User clicks wallet button
   ↓
2. Wallet connects → Returns public key
   ↓
3. Backend generates nonce → POST /api/auth/nonce
   ↓
4. User signs nonce → Wallet shows signing popup
   ↓
5. Backend verifies signature → POST /api/auth/verify
   ↓
6. JWT token created → Stored in HTTP-only cookie
   ↓
7. User redirected to dashboard
```

**Key Files:**
- `src/hooks/useAuth.js` - Main authentication hook
- `src/lib/solanaWallets.js` - Wallet detection and connection utilities
- `src/components/LoginModal.jsx` - Login UI component
- `src/app/api/auth/nonce/route.js` - Nonce generation
- `src/app/api/auth/verify/route.js` - Signature verification

**Security Features:**
- Nonce-based authentication (prevents replay attacks)
- Ed25519 signature verification (Solana's cryptographic standard)
- Nonces expire after 5 minutes
- One-time use nonces (deleted after verification)
- HTTP-only cookies for token storage

### 2. Twitter/X OAuth Authentication

**Authentication Flow:**

```
1. User clicks Twitter button
   ↓
2. Redirect to Twitter OAuth → OAuth 2.0 with PKCE
   ↓
3. Twitter redirects to callback → /auth/twitter/callback
   ↓
4. Backend exchanges code for token → /api/auth/twitter/callback
   ↓
5. JWT token created → Stored in HTTP-only cookie
   ↓
6. User redirected to dashboard
```

**Key Files:**
- `src/hooks/useAuth.js` - Twitter login handler
- `src/app/auth/twitter/callback/page.js` - Callback page
- `src/app/api/auth/twitter/callback/route.js` - OAuth token exchange

**Status:** Frontend ready, backend integration may need completion

---

## API Routes

### Authentication Endpoints

#### `POST /api/auth/nonce`
Generates a unique nonce for wallet authentication.

**Request:**
```json
{
  "walletAddress": "string",
  "walletType": "phantom" | "backpack" | "solflare" | "brave" | "bitget"
}
```

**Response:**
```json
{
  "nonce": "Sign in to SparksClub\n\nNonce: {hex_string}",
  "expiresIn": 300
}
```

**Implementation:** `src/app/api/auth/nonce/route.js`

---

#### `POST /api/auth/verify`
Verifies wallet signature and creates session.

**Request:**
```json
{
  "walletAddress": "string",
  "walletType": "string",
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

**Implementation:** `src/app/api/auth/verify/route.js`

**Security:**
- Validates nonce exists and hasn't expired
- Verifies Ed25519 signature using `tweetnacl`
- Deletes nonce after successful verification
- Creates JWT token with 7-day expiration

---

#### `GET /api/auth/me`
Returns current authenticated user.

**Response (Authenticated):**
```json
{
  "user": {
    "walletAddress": "string",
    "walletType": "string"
  }
}
```

**Response (Unauthenticated):**
```json
{
  "error": "Not authenticated"
}
```
Status: `401`

**Implementation:** `src/app/api/auth/me/route.js`

---

#### `POST /api/auth/logout`
Clears authentication cookie.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Implementation:** `src/app/api/auth/logout/route.js`

---

#### `GET /api/auth/twitter/callback`
Handles Twitter OAuth callback (if implemented).

**Implementation:** `src/app/api/auth/twitter/callback/route.js`

---

## Components Structure

### Core Components

#### `LoginModal.jsx`
Main login modal component with wallet and Twitter options.

**Features:**
- Detects installed wallets automatically
- Shows install links for unavailable wallets
- Handles wallet connection and authentication flow
- Displays loading and error states
- Shows signing and success modals

**Location:** `src/components/LoginModal.jsx`

---

#### `Sidebar.jsx`
Navigation sidebar with authentication-aware buttons.

**Features:**
- Collapsible sidebar
- Shows login/logout based on auth state
- Protected route indicators
- Logo and navigation items

**Location:** `src/components/Sidebar.jsx`

---

#### `WalletSigningModal.jsx`
Modal shown during wallet signature process.

**Location:** `src/components/WalletSigningModal.jsx`

---

#### `WalletSuccessModal.jsx`
Success confirmation modal after authentication.

**Location:** `src/components/WalletSuccessModal.jsx`

---

### UI Components

- `HeroHeader.jsx` - Hero section header
- `SearchBar.jsx` - Search functionality
- `TickerStrip.jsx` - Crypto ticker display
- `NewsCard.jsx` - News feed cards
- `HowItWorksCard.jsx` - Feature explanation
- `TrendsRanking.jsx` - Trending coins ranking
- `TopCreators.jsx` - Top creators list
- `StatsGrid.jsx` - Statistics display
- `RankingItem.jsx` - Individual ranking item
- `CreatorRankingItem.jsx` - Creator ranking item
- `TPSRankingItem.jsx` - TPS ranking item

---

## Configuration

### Next.js Configuration

**File:** `next.config.mjs`

```javascript
{
  images: {
    remotePatterns: [...],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}
```

### Tailwind CSS

**File:** `postcss.config.mjs`

Uses Tailwind CSS 4 with PostCSS.

### ESLint

**File:** `eslint.config.mjs`

Uses Next.js ESLint configuration.

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# JWT Secret (REQUIRED - Use strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Twitter OAuth (Optional)
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id_here

# Solana RPC Endpoint (Optional - defaults to mainnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Node Environment
NODE_ENV=production
```

### Generating JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet extension (for testing)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing Authentication

1. **Wallet Authentication:**
   - Install a Solana wallet extension (Phantom, Solflare, etc.)
   - Click "Login" in the sidebar
   - Select your wallet
   - Approve connection and signature

2. **Twitter Authentication:**
   - Configure `NEXT_PUBLIC_TWITTER_CLIENT_ID`
   - Click "Twitter" in login modal
   - Complete OAuth flow

---

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Use HTTPS (required for secure cookies)
- [ ] Replace in-memory stores with Redis or database
- [ ] Add rate limiting to API routes
- [ ] Configure CORS if needed
- [ ] Set up error logging and monitoring
- [ ] Update Twitter OAuth callback URLs
- [ ] Test all authentication flows

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Production

Ensure all required environment variables are set in your hosting platform:
- `JWT_SECRET` (required)
- `NEXT_PUBLIC_TWITTER_CLIENT_ID` (if using Twitter auth)
- `NODE_ENV=production`

---

## Troubleshooting

### Wallet Connection Issues

**Problem:** Wallet not detected
- **Solution:** Refresh page after installing wallet extension
- **Solution:** Check browser console for errors
- **Solution:** Ensure wallet extension is enabled

**Problem:** Connection fails
- **Solution:** Ensure wallet is unlocked
- **Solution:** Check if popup was blocked
- **Solution:** Verify wallet extension is up to date

**Problem:** Signature verification fails
- **Solution:** Ensure nonce hasn't expired (5 minutes)
- **Solution:** Check message format matches between client and server
- **Solution:** Verify wallet is using correct public key

### Session Issues

**Problem:** Session not persisting
- **Solution:** Check cookies are enabled in browser
- **Solution:** Verify `credentials: "include"` in fetch requests
- **Solution:** Check browser console for cookie errors
- **Solution:** Ensure HTTPS in production (required for secure cookies)

### API Errors

**Problem:** Nonce not found
- **Solution:** Nonce may have expired (5 minutes)
- **Solution:** Request a new nonce
- **Solution:** Check server logs for nonce store state

**Problem:** Signature verification fails
- **Solution:** Ensure message format matches exactly
- **Solution:** Check signature encoding (should be base64)
- **Solution:** Verify public key format (base58)

### Development Issues

**Problem:** Hot reload not working
- **Solution:** Restart development server
- **Solution:** Clear `.next` directory

**Problem:** Module not found errors
- **Solution:** Run `npm install` again
- **Solution:** Check `package.json` dependencies

---

## Security Considerations

### Current Security Measures

1. **Nonce-based Authentication**
   - Prevents replay attacks
   - 5-minute expiration
   - One-time use (deleted after verification)

2. **Ed25519 Signature Verification**
   - Cryptographically secure
   - Solana's standard signature algorithm

3. **HTTP-only Cookies**
   - JWT tokens stored in HTTP-only cookies
   - Not accessible via JavaScript
   - Prevents XSS attacks

4. **Secure Cookies in Production**
   - `secure` flag enabled in production
   - Requires HTTPS

### Security Recommendations

1. **Replace In-Memory Stores**
   - Current: In-memory Map for nonces and users
   - Recommended: Redis or database for production
   - **Impact:** Nonces and sessions lost on server restart

2. **Rate Limiting**
   - Add rate limiting to `/api/auth/nonce` and `/api/auth/verify`
   - Prevent brute force attacks
   - Use libraries like `express-rate-limit` or similar

3. **CORS Configuration**
   - Configure CORS headers if needed
   - Restrict to trusted domains

4. **Input Validation**
   - Validate all inputs in API routes
   - Sanitize user inputs
   - Check wallet address format

5. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors server-side only
   - Return generic error messages to clients

6. **JWT Secret**
   - Use strong, random JWT secret
   - Never commit secrets to version control
   - Rotate secrets periodically

---

## Future Improvements

### Short-term

1. **Database Integration**
   - Replace in-memory stores with database
   - Store user profiles
   - Track authentication history

2. **Twitter OAuth Completion**
   - Complete backend token exchange
   - Store Twitter user profiles
   - Link Twitter accounts to wallets

3. **User Profiles**
   - Create user profile pages
   - Display wallet addresses and Twitter handles
   - Track user activity

4. **Error Logging**
   - Integrate error logging service (Sentry, LogRocket, etc.)
   - Monitor authentication failures
   - Track API errors

### Long-term

1. **Multi-chain Support**
   - Support Ethereum wallets
   - Support other blockchain networks
   - Cross-chain authentication

2. **Advanced Security**
   - Two-factor authentication
   - Session management dashboard
   - Device tracking

3. **Social Features**
   - User following system
   - Social feed
   - Comments and interactions

4. **Analytics**
   - User analytics dashboard
   - Authentication metrics
   - Performance monitoring

---

## Additional Resources

### Documentation Files

- `AUTH_SETUP.md` - Authentication setup guide
- `WALLET_AUTH_SETUP.md` - Wallet authentication detailed guide
- `README.md` - Basic project information

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [JWT.io](https://jwt.io/) - JWT token debugging

### Key Dependencies

```json
{
  "@solana/wallet-adapter-base": "^0.9.27",
  "@solana/wallet-adapter-phantom": "^0.9.28",
  "@solana/wallet-adapter-react": "^0.15.39",
  "@solana/wallet-adapter-react-ui": "^0.9.39",
  "@solana/wallet-adapter-wallets": "^0.19.37",
  "@solana/web3.js": "^1.98.4",
  "bs58": "^6.0.0",
  "jsonwebtoken": "^9.0.2",
  "next": "16.0.3",
  "react": "19.2.0",
  "tweetnacl": "^1.0.3"
}
```

---

## Support Contacts

For technical support or questions:
- Check this documentation first
- Review error logs in browser console and server logs
- Check GitHub issues (if applicable)
- Contact development team

---

**Last Updated:** Generated automatically
**Version:** 1.0.0
**Maintained By:** Development Team

