# Authentication Setup Guide

This project supports three authentication methods:
1. **Twitter/X OAuth 2.0**
2. **Phantom Wallet** (Solana)
3. **Bitget Wallet** (Solana)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Twitter OAuth 2.0 Configuration
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id_here

# Solana RPC Endpoint (optional, defaults to mainnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Enable OAuth 2.0
4. Set the callback URL to: `http://localhost:3000/auth/twitter/callback` (for development)
5. Copy your Client ID to `NEXT_PUBLIC_TWITTER_CLIENT_ID`

**Note:** For production, you'll need to:
- Set up a backend endpoint to exchange the authorization code for tokens
- Update the callback URL to your production domain
- Implement token storage securely

## Wallet Setup

### Phantom Wallet
- Users need to install [Phantom Wallet](https://phantom.app/) browser extension
- The app will automatically detect if Phantom is installed
- If not installed, users will be redirected to the download page

### Bitget Wallet
- Users need to install [Bitget Wallet](https://web3.bitget.com/) browser extension
- The app checks for `window.bitkeep.solana` to detect installation
- If not installed, users will be redirected to the download page

## Current Implementation

The authentication system is set up with:
- ✅ Solana wallet adapter integration
- ✅ Twitter OAuth flow (frontend ready, backend integration needed)
- ✅ Wallet connection handlers
- ✅ Session persistence (localStorage)
- ✅ Loading states and error handling

## Next Steps

1. **Backend Integration**: Set up a backend API to handle Twitter OAuth token exchange
2. **Session Management**: Implement secure session storage (consider using cookies or JWT)
3. **User Profile**: Fetch and store user profile data after authentication
4. **Protected Routes**: Implement route protection based on authentication status

## Testing

- **Phantom**: Install the extension and click "Phantom Wallet" in the login modal
- **Bitget**: Install the extension and click "Bitget Wallet" in the login modal
- **Twitter**: Configure OAuth credentials and test the flow (requires backend setup)

