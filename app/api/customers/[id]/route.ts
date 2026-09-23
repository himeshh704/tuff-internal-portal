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
      { error: 'Access Denied: Workers cannot delete customers' },
      { status: 403 }
    );
  }

  try {
    serverDb.deleteCustomer(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
