import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/admin/tokens - List all tokens
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await CreatorToken.findAll({ page, limit });

    return NextResponse.json({
      tokens: result.tokens,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
