import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as CreatorApplication from '@/lib/models/CreatorApplication';

// POST /api/creator/apply - Submit creator application
export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if already a creator
    if (user.isCreator) {
      return NextResponse.json({ error: 'You are already a creator' }, { status: 400 });
    }

    const { displayName, bio, category, socialLinks } = await request.json();

    if (!displayName || !bio || !category) {
      return NextResponse.json({ error: 'Display name, bio, and category are required' }, { status: 400 });
    }

    if (bio.length < 50) {
      return NextResponse.json({ error: 'Bio must be at least 50 characters' }, { status: 400 });
    }

    const application = await CreatorApplication.create({
      userId: user._id.toString(),
      displayName,
      bio,
      category,
      socialLinks: socialLinks || {}
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application._id.toString(),
        status: application.status,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    if (error.message.includes('pending application')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Creator apply error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

// GET /api/creator/apply - Get current user's application status
export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const application = await CreatorApplication.getByUser(user._id.toString());

    return NextResponse.json({
      isCreator: user.isCreator || false,
      creatorStatus: user.creatorStatus || null,
      application: application ? {
        id: application._id.toString(),
        status: application.status,
        displayName: application.displayName,
        bio: application.bio,
        category: application.category,
        socialLinks: application.socialLinks,
        createdAt: application.createdAt,
        reviewNote: application.reviewNote
      } : null
    });
  } catch (error) {
    console.error('Get creator status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
