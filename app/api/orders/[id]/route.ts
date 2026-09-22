import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (session.role === 'worker') {
    return NextResponse.json(
      { error: 'Access Denied: Workers cannot delete orders' },
      { status: 403 }
    );
  }

  try {
    const orderId = params.id;
    const dbData = serverDb.getOrders();
    const ord = dbData.find((o) => o.id === orderId || o.order_number === orderId);

    if (ord) {
      // Filter out order and its work assignments
      const freshOrders = dbData.filter((o) => o.id !== ord.id);
      // Update in server database store
      (serverDb as any).orders = freshOrders;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
