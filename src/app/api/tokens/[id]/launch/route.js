import { NextResponse } from 'next/server';
import { requireCreator } from '@/lib/auth';
import * as CreatorToken from '@/lib/models/CreatorToken';

// POST /api/tokens/[id]/launch - Launch token (mock)
export async function POST(request, { params }) {
  try {
    const user = await requireCreator(request);
    const { id } = await params;

    // Verify ownership
    const token = await CreatorToken.findById(id);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (token.status !== 'pending') {
      return NextResponse.json({ error: 'Token already launched or failed' }, { status: 400 });
    }

    // Mock launch - in production, this would interact with blockchain
    const launched = await CreatorToken.mockLaunch(id);

    return NextResponse.json({
      token: launched,
      message: 'Token launched successfully (mock)'
    });
  } catch (error) {
    if (error.message === 'Not authenticated' || error.message.includes('Creator')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Launch token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
