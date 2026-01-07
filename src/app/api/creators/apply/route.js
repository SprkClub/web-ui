import { NextResponse } from 'next/server';
import { requireAuth, serializeUser } from '@/lib/auth';
import * as CreatorApplication from '@/lib/models/CreatorApplication';

// POST /api/creators/apply - Submit creator application
export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { displayName, bio, category, socialLinks } = await request.json();

    if (!displayName || !bio || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await CreatorApplication.create({
      userId: user._id.toString(),
      displayName,
      bio,
      category,
      socialLinks
    });

    return NextResponse.json({ application });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('pending application')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Apply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/creators/apply - Get my application status
export async function GET(request) {
  try {
    const user = await requireAuth(request);
    const application = await CreatorApplication.getByUser(user._id.toString());

    return NextResponse.json({ application, user: serializeUser(user) });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Get application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
