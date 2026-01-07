import { NextResponse } from 'next/server';
import * as User from '@/lib/models/User';
import * as Post from '@/lib/models/Post';
import { getCurrentUser, serializeUser } from '@/lib/auth';

// GET /api/users/[id] - Get user profile
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = await getCurrentUser(request);
    const isFollowing = currentUser ?
      user.followers?.some(fid => fid.toString() === currentUser._id.toString()) : false;

    const postsResult = await Post.getByUser({ userId: id, page: 1, limit: 10 });
    const totalLikes = await Post.getTotalLikesByUser(id);

    return NextResponse.json({
      user: {
        ...serializeUser(user),
        isFollowing
      },
      posts: postsResult.posts,
      stats: {
        totalPosts: postsResult.total,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
