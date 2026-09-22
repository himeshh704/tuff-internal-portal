import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // STRICT ROLE GUARD: Workers cannot fetch all orders!
  if (session.role === 'worker') {
    return NextResponse.json(
      { error: 'Access Denied: Workers do not have permission to view owner order management.' },
      { status: 403 }
    );
  }

  const orders = serverDb.getOrders();
  return NextResponse.json({ orders });
}
