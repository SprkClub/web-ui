import { NextResponse } from 'next/server';
import { requireCreator } from '@/lib/auth';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/tokens/my - Get my token
export async function GET(request) {
  try {
    const user = await requireCreator(request);
    const token = await CreatorToken.getByCreator(user._id.toString());

    return NextResponse.json({ token });
  } catch (error) {
    if (error.message === 'Not authenticated' || error.message.includes('Creator')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Get my token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
