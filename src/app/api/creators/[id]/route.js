import { NextResponse } from 'next/server';
import * as User from '@/lib/models/User';
import * as Post from '@/lib/models/Post';
import { serializeUser } from '@/lib/auth';

// GET /api/creators/[id] - Get creator profile
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await User.findById(id);

    if (!user || !user.isCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const [postsResult, totalLikes] = await Promise.all([
      Post.getByUser({ userId: id, page: 1, limit: 10 }),
      Post.getTotalLikesByUser(id)
    ]);

    return NextResponse.json({
      creator: serializeUser(user),
      posts: postsResult.posts,
      stats: {
        totalPosts: postsResult.total,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Get creator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
