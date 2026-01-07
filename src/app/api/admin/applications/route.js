import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as CreatorApplication from '@/lib/models/CreatorApplication';

// GET /api/admin/applications - List creator applications
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || null;

    const result = await CreatorApplication.findAll({ page, limit, status });

    return NextResponse.json({
      applications: result.applications,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
