import { NextResponse } from 'next/server';
import { findOrCreateByTwitter } from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

const TWITTER_CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/twitter/callback`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const codeVerifier = searchParams.get('code_verifier');

    if (error) {
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
    }

    // Dev mode: mock login if not configured
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      const user = await findOrCreateByTwitter({
        twitterId: 'mock_123456',
        twitterUsername: 'test_user',
        twitterName: 'Test User',
        profileImage: null
      });

      const token = generateToken(user);
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
      return response;
    }

    if (!code || !codeVerifier) {
      return NextResponse.redirect(new URL('/?error=missing_params', request.url));
    }

    // Exchange code for token
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });

    if (!tokenRes.ok) {
      console.error('Token exchange failed:', await tokenRes.json());
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const { access_token } = await tokenRes.json();

    // Fetch user info
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
    }

    const { data } = await userRes.json();

    // Save to MongoDB
    const user = await findOrCreateByTwitter({
      twitterId: data.id,
      twitterUsername: data.username,
      twitterName: data.name,
      profileImage: data.profile_image_url
    });

    const token = generateToken(user);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
