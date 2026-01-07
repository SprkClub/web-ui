import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as CreatorToken from '@/lib/models/CreatorToken';

// POST /api/admin/tokens/[id]/feature - Feature/unfeature token
export async function POST(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { featured } = await request.json();

    await CreatorToken.setFeatured(id, featured);
    const token = await CreatorToken.findById(id);

    return NextResponse.json({ token });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Feature token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
