import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { getStoredNonce, deleteNonce } from '@/lib/nonceStore';
import { findOrCreateByWallet } from '@/lib/models/User';
import { generateToken, serializeUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const { walletAddress, walletType, nonce, signature } = await request.json();

    // Validate input
    if (!walletAddress || !walletType || !nonce || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['phantom', 'backpack', 'solflare', 'brave'];
    if (!validTypes.includes(walletType)) {
      return NextResponse.json({ error: 'Invalid wallet type' }, { status: 400 });
    }

    // Verify nonce
    const storedNonce = getStoredNonce(walletAddress.trim());
    if (!storedNonce || storedNonce.nonce !== nonce) {
      return NextResponse.json({ error: 'Invalid or expired nonce' }, { status: 401 });
    }

    // Verify signature
    try {
      const messageBytes = new TextEncoder().encode(nonce);
      const signatureBytes = Buffer.from(signature, 'base64');
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // Delete nonce to prevent reuse
    deleteNonce(walletAddress);

    // Save to MongoDB
    const user = await findOrCreateByWallet({ walletAddress, walletType });
    const token = generateToken(user);

    const response = NextResponse.json({ user: serializeUser(user), token });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
