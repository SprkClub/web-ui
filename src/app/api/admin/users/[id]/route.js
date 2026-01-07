import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as User from '@/lib/models/User';
import { serializeUser } from '@/lib/auth';

// GET /api/admin/users/[id] - Get user details
export async function GET(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user (ban, set admin, etc.)
export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    if (body.isAdmin !== undefined) {
      await User.setAdmin(id, body.isAdmin);
    }

    if (body.isBanned !== undefined) {
      await User.setBanned(id, body.isBanned);
    }

    if (body.isCreator !== undefined || body.creatorStatus !== undefined) {
      await User.setCreatorStatus(id, {
        isCreator: body.isCreator,
        creatorStatus: body.creatorStatus
      });
    }

    const user = await User.findById(id);
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
