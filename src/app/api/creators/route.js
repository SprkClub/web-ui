import { NextResponse } from 'next/server';
import * as User from '@/lib/models/User';
import { serializeUser } from '@/lib/auth';

// GET /api/creators - List approved creators
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await User.findCreators({ page, limit });

    return NextResponse.json({
      creators: result.users.map(serializeUser),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get creators error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
