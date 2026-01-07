import { NextResponse } from 'next/server';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/tokens/[id] - Get token details
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const token = await CreatorToken.findById(id);

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
