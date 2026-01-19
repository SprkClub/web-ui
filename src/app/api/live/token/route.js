import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Simple token builder for development (use agora-access-token package in production)
function buildTokenWithUid(appId, appCertificate, channelName, uid, role, expirationTimeInSeconds) {
  // For development, return a mock token structure
  // In production, use: npm install agora-access-token
  // Then: import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
  
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return 'mock_token_for_development';
  }

  // Basic token generation (simplified - use proper agora-access-token in production)
  const payload = {
    appId,
    channelName,
    uid: uid.toString(),
    role: role === 'publisher' ? 1 : 2,
    expirationTimeInSeconds,
    timestamp: Math.floor(Date.now() / 1000),
  };

  // In production, use RtcTokenBuilder.buildTokenWithUid()
  // This is a placeholder
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    const uid = searchParams.get('uid') || user?._id?.toString() || Date.now().toString();

    if (!channelName) {
      return NextResponse.json({ error: 'Channel name required' }, { status: 400 });
    }

    // If Agora credentials not configured, return error
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.warn('Agora credentials not configured');
      return NextResponse.json({
        error: 'Agora not configured',
        configured: false,
        message: 'Agora SDK credentials are not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables.'
      }, { status: 503 });
    }

    // Token expires in 24 hours
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 3600 * 24;
    
    // Determine role - publishers (streamers) can publish, subscribers can only subscribe
    const role = searchParams.get('role') === 'publisher' ? 'publisher' : 'subscriber';

    const token = buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      parseInt(uid) || 0,
      role,
      expirationTimeInSeconds
    );

    return NextResponse.json({
      token,
      appId: AGORA_APP_ID,
      channelName,
      uid,
      configured: true
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}