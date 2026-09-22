import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = serverDb.getUsers().find((u) => u.id === session.userId);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const { passwordHash, ...safeUser } = user;

  return NextResponse.json({
    authenticated: true,
    user: safeUser,
  });
}
