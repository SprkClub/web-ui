import { NextResponse } from 'next/server';
import { getCurrentUser, serializeUser } from '@/lib/auth';
import * as Post from '@/lib/models/Post';

// GET /api/posts/me - Get current user's posts
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await Post.getByUser({
      userId: currentUser._id.toString(),
      page,
      limit
    });

    // Format posts
    const posts = result.posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      id: post._id.toString(),
      isLiked: post.likes?.some(id => id.toString() === currentUser._id.toString()) || false,
      user: post.user ? {
        ...serializeUser(post.user),
        id: post.user._id.toString()
      } : null
    }));

    return NextResponse.json({
      posts,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
