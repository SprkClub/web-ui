import { NextResponse } from 'next/server';
import { getCurrentUser, serializeUser } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

// Admin usernames
const ADMIN_USERNAMES = ['iathulnambiar'];

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user should be admin by username
    const isAdminByUsername = user.twitterUsername &&
      ADMIN_USERNAMES.includes(user.twitterUsername.toLowerCase());

    // Auto-fix admin flag if needed
    if (isAdminByUsername && !user.isAdmin) {
      const usersCol = await getCollection('users');
      await usersCol.updateOne(
        { _id: user._id },
        { $set: { isAdmin: true } }
      );
      user.isAdmin = true;
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
