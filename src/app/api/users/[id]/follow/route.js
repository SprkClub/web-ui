import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as User from '@/lib/models/User';

// POST /api/users/[id]/follow - Follow user
export async function POST(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    if (user._id.toString() === id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await User.followUser(user._id.toString(), id);

    return NextResponse.json({ message: 'User followed' });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]/follow - Unfollow user
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    await User.unfollowUser(user._id.toString(), id);

    return NextResponse.json({ message: 'User unfollowed' });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
