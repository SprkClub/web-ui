import { NextResponse } from 'next/server';
import { requireAuth, serializeUser } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

// GET /api/users/followers - Get my followers
export async function GET(request) {
  try {
    const user = await requireAuth(request);

    if (!user.followers?.length) {
      return NextResponse.json({ followers: [] });
    }

    const usersCol = await getCollection('users');
    const followers = await usersCol.find({
      _id: { $in: user.followers }
    }).toArray();

    return NextResponse.json({
      followers: followers.map(serializeUser)
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Get followers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
