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

export async function POST(request: Request) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (session.role === 'worker') {
    return NextResponse.json(
      { error: 'Access Denied: Workers cannot create orders.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const order = serverDb.createOrder(body);
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
