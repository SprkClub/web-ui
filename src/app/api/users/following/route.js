import { NextResponse } from 'next/server';
import { requireAuth, serializeUser } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

// GET /api/users/following - Get who I'm following
export async function GET(request) {
  try {
    const user = await requireAuth(request);

    if (!user.following?.length) {
      return NextResponse.json({ following: [] });
    }

    const usersCol = await getCollection('users');
    const following = await usersCol.find({
      _id: { $in: user.following }
    }).toArray();

    return NextResponse.json({
      following: following.map(serializeUser)
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Get following error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
