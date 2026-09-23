import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (session.role === 'worker') {
    return NextResponse.json(
      { error: 'Access Denied: Workers cannot assign work.' },
      { status: 403 }
    );
  }

  try {
    const { orderId, itemId, workerId, requiredQty, orderData } = await request.json();
    const assignment = serverDb.assignWork(orderId, itemId, workerId, requiredQty, orderData);
    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to assign work' },
      { status: 400 }
    );
  }
}
