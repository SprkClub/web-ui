import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import * as Subscription from '@/lib/models/Subscription';
import { getCollection } from '@/lib/mongodb';

// GET /api/creator/subscription/[username] - Get a creator's public subscription plan
export async function GET(request, { params }) {
  try {
    const { username } = await params;

    // Find the creator
    const usersCol = await getCollection('users');
    const creator = await usersCol.findOne({
      $or: [
        { username: username },
        { twitterUsername: username }
      ],
      isCreator: true
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Get the subscription plan
    const plan = await SubscriptionPlan.getByCreatorId(creator._id.toString());

    if (!plan || !plan.isActive) {
      return NextResponse.json({
        plan: null,
        isSubscribed: false
      });
    }

    // Check if current user is subscribed
    let isSubscribed = false;
    let subscription = null;
    const currentUser = await getCurrentUser(request);

    if (currentUser) {
      subscription = await Subscription.getActiveSubscription(
        currentUser._id.toString(),
        creator._id.toString()
      );
      isSubscribed = !!subscription;
    }

    return NextResponse.json({
      plan: {
        id: plan._id.toString(),
        title: plan.title,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        walletAddress: plan.walletAddress,
        creatorId: creator._id.toString(),
        creatorName: creator.displayName || creator.twitterName,
        creatorUsername: creator.twitterUsername || creator.username
      },
      isSubscribed,
      subscription: subscription ? {
        id: subscription._id.toString(),
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
        status: subscription.status
      } : null
    });
  } catch (error) {
    console.error('Get creator subscription error:', error);
    return NextResponse.json({ error: 'Failed to get subscription plan' }, { status: 500 });
  }
}
