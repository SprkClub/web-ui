import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import * as Subscription from '@/lib/models/Subscription';

// POST /api/subscriptions/purchase - Purchase a subscription
export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { planId, transactionHash, walletAddress } = await request.json();

    // Validation
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Get the plan
    const plansCol = await import('@/lib/mongodb').then(m => m.getCollection('subscriptionPlans'));
    const { ObjectId } = await import('mongodb');
    const plan = await plansCol.findOne({ _id: new ObjectId(planId), isActive: true });

    if (!plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    // Check if trying to subscribe to own plan
    if (plan.creatorId.toString() === user._id.toString()) {
      return NextResponse.json({ error: 'Cannot subscribe to your own plan' }, { status: 400 });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.getActiveSubscription(
      user._id.toString(),
      plan.creatorId.toString()
    );

    if (existingSubscription) {
      return NextResponse.json({
        error: 'You already have an active subscription to this creator',
        subscription: {
          id: existingSubscription._id.toString(),
          expiresAt: existingSubscription.expiresAt
        }
      }, { status: 400 });
    }

    // For paid subscriptions, verify transaction hash is provided
    if (plan.price > 0 && !transactionHash) {
      return NextResponse.json({ error: 'Transaction hash required for paid subscriptions' }, { status: 400 });
    }

    // Create the subscription
    const subscription = await Subscription.create({
      subscriberId: user._id.toString(),
      creatorId: plan.creatorId.toString(),
      planId: plan._id.toString(),
      price: plan.price,
      transactionHash: transactionHash || null,
      walletAddress
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id.toString(),
        creatorId: plan.creatorId.toString(),
        price: subscription.price,
        currency: subscription.currency,
        status: subscription.status,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt
      }
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('Purchase subscription error:', error);
    return NextResponse.json({ error: 'Failed to purchase subscription' }, { status: 500 });
  }
}
