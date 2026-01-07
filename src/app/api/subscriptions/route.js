import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as Subscription from '@/lib/models/Subscription';

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await Subscription.getBySubscriber(user._id.toString(), { page, limit });

    return NextResponse.json({
      subscriptions: result.subscriptions.map(sub => ({
        id: sub._id.toString(),
        creator: {
          id: sub.creator._id.toString(),
          name: sub.creator.displayName || sub.creator.twitterName,
          username: sub.creator.twitterUsername || sub.creator.username,
          profileImage: sub.creator.profileImage
        },
        plan: sub.plan ? {
          title: sub.plan.title,
          description: sub.plan.description,
          price: sub.plan.price
        } : null,
        price: sub.price,
        currency: sub.currency,
        status: sub.status,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
        transactionHash: sub.transactionHash
      })),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('Get subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to get subscriptions' }, { status: 500 });
  }
}
