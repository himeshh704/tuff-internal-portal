import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // STRICT ROLE GUARD: Workers cannot fetch customer directory!
  if (session.role === 'worker') {
    return NextResponse.json(
      { error: 'Access Denied: Workers do not have permission to access customer directory.' },
      { status: 403 }
    );
  }

  const customers = serverDb.getCustomers();
  return NextResponse.json({ customers });
}
