import { NextResponse } from 'next/server';
import { requirePostAccess, getCurrentUser, serializeUser } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import * as Post from '@/lib/models/Post';

// GET /api/posts - Get feed
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const following = searchParams.get('following') === 'true';
    const userId = searchParams.get('userId');

    const currentUser = await getCurrentUser(request);

    let result;
    if (userId) {
      result = await Post.getByUser({ userId, page, limit });
    } else {
      result = await Post.getFeed({
        page,
        limit,
        userId: currentUser?._id?.toString(),
        followingOnly: following
      });
    }

    // Add isLiked flag for current user
    const posts = result.posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      isLiked: currentUser ? post.likes?.some(id => id.toString() === currentUser._id.toString()) : false,
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
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts - Create post (only creators and admins)
export async function POST(request) {
  try {
    const user = await requirePostAccess(request);

    const formData = await request.formData();
    const content = formData.get('content');
    const files = formData.getAll('files');

    if (!content && files.length === 0) {
      return NextResponse.json({ error: 'Content or media required' }, { status: 400 });
    }

    // Upload media files
    const mediaUrls = [];
    let mediaType = null;

    for (const file of files) {
      if (file && file.size > 0) {
        const result = await uploadToCloudinary(file, 'posts');
        mediaUrls.push(result.secure_url);
        if (!mediaType) {
          mediaType = result.resource_type === 'video' ? 'video' : 'image';
        }
      }
    }

    const post = await Post.create({
      userId: user._id.toString(),
      content: content || '',
      mediaUrls,
      mediaType
    });

    return NextResponse.json({
      post: {
        ...post,
        _id: post._id.toString(),
        user: serializeUser(user)
      }
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('creators and admins') || error.message === 'Account is banned') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
