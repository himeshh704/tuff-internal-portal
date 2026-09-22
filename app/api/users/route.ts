import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const users = serverDb.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    line_assigned: u.line_assigned,
    avatar_url: u.avatar_url,
  }));

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== 'owner') {
    return NextResponse.json(
      { error: 'Access Denied: Only Owner/Admin can create user accounts' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const newUser = serverDb.addUser({
      name: body.name,
      email: body.email,
      passwordHash: body.password || 'worker123',
      role: body.role,
      phone: body.phone,
      line_assigned: body.line_assigned,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create user account' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== 'owner') {
    return NextResponse.json(
      { error: 'Access Denied: Only Owner/Admin can modify user accounts' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const updated = serverDb.updateUser(body.id, {
      name: body.name,
      email: body.email,
      passwordHash: body.password,
      role: body.role,
      phone: body.phone,
      line_assigned: body.line_assigned,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update user account' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== 'owner') {
    return NextResponse.json(
      { error: 'Access Denied: Only Owner/Admin can delete user accounts' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    serverDb.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete user account' },
      { status: 500 }
    );
  }
}
