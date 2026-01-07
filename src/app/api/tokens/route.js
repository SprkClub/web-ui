import { NextResponse } from 'next/server';
import { requireCreator, getCurrentUser } from '@/lib/auth';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/tokens - List tokens
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const filter = searchParams.get('filter') || 'all';

    // Map filter to query options
    const options = { page, limit };
    if (filter === 'featured') {
      options.featuredOnly = true;
    } else if (filter === 'trending') {
      options.sortBy = 'volume';
    } else if (filter === 'new') {
      options.sortBy = 'createdAt';
    }

    const result = await CreatorToken.findAll(options);

    return NextResponse.json({
      tokens: result.tokens,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tokens - Create token (mock)
export async function POST(request) {
  try {
    const user = await requireCreator(request);
    const { tokenName, tokenSymbol, description, imageUrl } = await request.json();

    if (!tokenName || !tokenSymbol) {
      return NextResponse.json({ error: 'Token name and symbol required' }, { status: 400 });
    }

    if (tokenSymbol.length > 10) {
      return NextResponse.json({ error: 'Symbol must be 10 characters or less' }, { status: 400 });
    }

    const token = await CreatorToken.create({
      creatorId: user._id.toString(),
      tokenName,
      tokenSymbol,
      description,
      imageUrl
    });

    return NextResponse.json({ token });
  } catch (error) {
    if (error.message === 'Not authenticated' || error.message.includes('Creator')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('already has')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Create token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
