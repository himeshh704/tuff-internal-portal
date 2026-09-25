import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const orders = serverDb.getOrders();
  const assignments = serverDb.getAssignments();
  const logs = serverDb.getLogs();
  const customers = serverDb.getCustomers();
  const deletedOrderIds = serverDb.getDeletedOrderIds();
  const deletedAssignmentIds = serverDb.getDeletedAssignmentIds();
  const deletedCustomerIds = serverDb.getDeletedCustomerIds();

  return NextResponse.json({
    orders,
    assignments,
    logs,
    customers,
    deletedOrderIds,
    deletedAssignmentIds,
    deletedCustomerIds,
  });
}

export async function POST(request: Request) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = serverDb.mergeClientData(body);
    return NextResponse.json({
      success: true,
      orders: updated.orders,
      assignments: updated.workAssignments,
      customers: updated.customers,
      logs: updated.activityLogs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error processing sync' },
      { status: 500 }
    );
  }
}
