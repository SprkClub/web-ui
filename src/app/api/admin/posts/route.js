import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as Post from '@/lib/models/Post';

// GET /api/admin/posts - List all posts
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await Post.findAll({ page, limit });

    return NextResponse.json({
      posts: result.posts,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
