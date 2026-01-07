import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as CreatorApplication from '@/lib/models/CreatorApplication';

// POST /api/admin/applications/[id] - Approve or reject application
export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;
    const { action, note, reviewNote, displayName, ticker } = await request.json();
    const noteValue = note || reviewNote;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let application;
    if (action === 'approve') {
      // Pass display name and ticker for approval
      application = await CreatorApplication.approve(id, admin._id.toString(), noteValue, {
        displayName: displayName?.trim(),
        ticker: ticker?.trim().toUpperCase()
      });
    } else {
      application = await CreatorApplication.reject(id, admin._id.toString(), noteValue);
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found or already processed' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin application action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
