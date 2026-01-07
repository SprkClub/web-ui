import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as Post from '@/lib/models/Post';

// POST /api/posts/[id]/like - Like post
export async function POST(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const liked = await Post.like(id, user._id.toString());

    return NextResponse.json({ liked, message: liked ? 'Post liked' : 'Already liked' });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/like - Unlike post
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const unliked = await Post.unlike(id, user._id.toString());

    return NextResponse.json({ unliked, message: unliked ? 'Post unliked' : 'Was not liked' });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Unlike error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
