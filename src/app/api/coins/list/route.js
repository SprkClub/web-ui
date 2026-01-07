import { NextResponse } from 'next/server';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/coins/list - List all tokens (alias for /api/tokens)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const featured = searchParams.get('featured') === 'true';

    const result = await CreatorToken.findAll({ page, limit, featuredOnly: featured });

    // Format for frontend compatibility
    const coins = result.tokens.map(token => ({
      id: token._id.toString(),
      name: token.tokenName,
      symbol: token.tokenSymbol,
      description: token.description,
      image: token.imageUrl,
      contractAddress: token.contractAddress,
      status: token.status,
      isFeatured: token.isFeatured,
      launchDate: token.launchDate,
      createdAt: token.createdAt,
      creator: {
        id: token.creator?._id?.toString(),
        username: token.creator?.twitterUsername,
        name: token.creator?.displayName || token.creator?.twitterName,
        profileImage: token.creator?.profileImage
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        coins,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    console.error('List coins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
