import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import { getCollection } from '@/lib/mongodb';
import * as CreatorApplication from '@/lib/models/CreatorApplication';

// GET /api/admin/stats - Get dashboard stats
export async function GET(request) {
  try {
    await requireAdmin(request);

    const usersCol = await getCollection('users');
    const postsCol = await getCollection('posts');
    const tokensCol = await getCollection('creatorTokens');

    const [
      totalUsers,
      totalCreators,
      totalPosts,
      totalTokens,
      pendingApplications
    ] = await Promise.all([
      usersCol.countDocuments(),
      usersCol.countDocuments({ isCreator: true }),
      postsCol.countDocuments(),
      tokensCol.countDocuments(),
      CreatorApplication.getPendingCount()
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCreators,
        totalPosts,
        totalTokens,
        pendingApplications
      }
    });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
