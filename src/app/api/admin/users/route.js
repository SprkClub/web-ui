import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminMiddleware';
import * as User from '@/lib/models/User';
import { serializeUser } from '@/lib/auth';

// GET /api/admin/users - List all users
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';

    const result = await User.findAll({ page, limit, search });

    return NextResponse.json({
      users: result.users.map(serializeUser),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('Admin')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
