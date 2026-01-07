import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as Post from '@/lib/models/Post';

// GET /api/admin/posts/[id] - Get post details
export async function GET(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/posts/[id] - Hide/unhide post
export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { isHidden } = await request.json();

    await Post.hidePost(id, isHidden);
    const post = await Post.findById(id);

    return NextResponse.json({ post });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin update post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
