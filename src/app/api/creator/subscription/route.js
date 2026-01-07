import { NextResponse } from 'next/server';
import { requireCreator } from '@/lib/auth';
import * as SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import * as Subscription from '@/lib/models/Subscription';

// GET /api/creator/subscription - Get creator's subscription plan
export async function GET(request) {
  try {
    const user = await requireCreator(request);

    const plan = await SubscriptionPlan.getByCreatorId(user._id.toString());
    const subscriberCount = plan
      ? await Subscription.getSubscriberCount(user._id.toString())
      : 0;

    return NextResponse.json({
      plan: plan ? {
        id: plan._id.toString(),
        title: plan.title,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        walletAddress: plan.walletAddress,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      } : null,
      subscriberCount
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error.message === 'Creator access required') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }
    console.error('Get subscription plan error:', error);
    return NextResponse.json({ error: 'Failed to get subscription plan' }, { status: 500 });
  }
}

// POST /api/creator/subscription - Create or update subscription plan
export async function POST(request) {
  try {
    const user = await requireCreator(request);
    const { title, description, price, walletAddress } = await request.json();

    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
    }

    if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json({ error: 'Price must be 0 or greater' }, { status: 400 });
    }

    if (!walletAddress || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Valid Solana wallet address required' }, { status: 400 });
    }

    const plan = await SubscriptionPlan.upsert({
      creatorId: user._id.toString(),
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      walletAddress
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: plan._id.toString(),
        title: plan.title,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        walletAddress: plan.walletAddress,
        isActive: plan.isActive
      }
    });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error.message === 'Creator access required') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }
    console.error('Create subscription plan error:', error);
    return NextResponse.json({ error: 'Failed to create subscription plan' }, { status: 500 });
  }
}

// DELETE /api/creator/subscription - Deactivate subscription plan
export async function DELETE(request) {
  try {
    const user = await requireCreator(request);

    await SubscriptionPlan.deactivate(user._id.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error.message === 'Creator access required') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }
    console.error('Deactivate subscription plan error:', error);
    return NextResponse.json({ error: 'Failed to deactivate subscription plan' }, { status: 500 });
  }
}
