import { NextResponse } from 'next/server';
import { requireAuth, getCurrentUser, serializeUser } from '@/lib/auth';
import * as Post from '@/lib/models/Post';

// GET /api/posts/[id] - Get single post
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const post = await Post.findById(id);

    if (!post || post.isHidden) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentUser = await getCurrentUser(request);

    return NextResponse.json({
      post: {
        ...post,
        _id: post._id.toString(),
        isLiked: currentUser ? post.likes?.some(lid => lid.toString() === currentUser._id.toString()) : false,
        user: serializeUser(post.user)
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const result = await Post.deletePost(id, user._id.toString());

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Post not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
