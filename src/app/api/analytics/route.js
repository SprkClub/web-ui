import { NextResponse } from 'next/server';
import { requireCreator } from '@/lib/auth';
import * as Post from '@/lib/models/Post';
import * as User from '@/lib/models/User';
import * as CreatorToken from '@/lib/models/CreatorToken';

// GET /api/analytics - Get creator analytics
export async function GET(request) {
  try {
    const user = await requireCreator(request);
    const userId = user._id.toString();

    const [postsCount, totalLikes, token, followers] = await Promise.all([
      Post.countByUser(userId),
      Post.getTotalLikesByUser(userId),
      CreatorToken.getByCreator(userId),
      User.findById(userId).then(u => u?.followers?.length || 0)
    ]);

    // Get recent posts with engagement
    const recentPosts = await Post.getByUser({ userId, page: 1, limit: 5 });

    return NextResponse.json({
      analytics: {
        totalPosts: postsCount,
        totalLikes,
        followersCount: followers,
        hasToken: !!token,
        tokenStatus: token?.status || null,
        recentPosts: recentPosts.posts.map(p => ({
          id: p._id.toString(),
          content: p.content?.substring(0, 50),
          likesCount: p.likesCount,
          createdAt: p.createdAt
        }))
      }
    });
  } catch (error) {
    if (error.message === 'Not authenticated' || error.message.includes('Creator')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
