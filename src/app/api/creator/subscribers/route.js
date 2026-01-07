import { NextResponse } from 'next/server';
import { requireCreator } from '@/lib/auth';
import * as Subscription from '@/lib/models/Subscription';

// GET /api/creator/subscribers - Get creator's subscribers
export async function GET(request) {
  try {
    const user = await requireCreator(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const activeOnly = searchParams.get('active') === 'true';

    const result = await Subscription.getByCreator(user._id.toString(), {
      page,
      limit,
      activeOnly
    });

    return NextResponse.json({
      subscribers: result.subscriptions.map(sub => ({
        id: sub._id.toString(),
        subscriber: {
          id: sub.subscriber._id.toString(),
          name: sub.subscriber.displayName || sub.subscriber.twitterName,
          username: sub.subscriber.twitterUsername || sub.subscriber.username,
          profileImage: sub.subscriber.profileImage
        },
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
    if (error.message === 'Creator access required') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }
    console.error('Get subscribers error:', error);
    return NextResponse.json({ error: 'Failed to get subscribers' }, { status: 500 });
  }
}
