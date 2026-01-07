import { NextResponse } from 'next/server';
import * as User from '@/lib/models/User';
import * as Post from '@/lib/models/Post';
import { serializeUser, getCurrentUser } from '@/lib/auth';

// GET /api/creators/username/[username] - Get creator profile by username
export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const creator = await User.findCreatorByUsername(username);

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const creatorId = creator._id.toString();

    // Get posts and stats
    const [postsResult, totalLikes] = await Promise.all([
      Post.getByUser({ userId: creatorId, page: 1, limit: 20 }),
      Post.getTotalLikesByUser(creatorId)
    ]);

    // Check if current user is following this creator
    let isFollowing = false;
    const currentUser = await getCurrentUser(request);
    if (currentUser && currentUser.following) {
      isFollowing = currentUser.following.some(
        id => id.toString() === creatorId
      );
    }

    return NextResponse.json({
      creator: {
        ...serializeUser(creator),
        followers: creator.followers?.length || 0,
        following: creator.following?.length || 0,
      },
      posts: postsResult.posts.map(post => ({
        id: post._id.toString(),
        content: post.content,
        mediaUrls: post.mediaUrls || [],
        mediaType: post.mediaType,
        likesCount: post.likesCount || 0,
        createdAt: post.createdAt,
      })),
      stats: {
        totalPosts: postsResult.total,
        totalLikes
      },
      isFollowing
    });
  } catch (error) {
    console.error('Get creator by username error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
