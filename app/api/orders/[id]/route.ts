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
    serverDb.deleteOrder(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { action, assignmentId, reason } = await request.json();
    if (action === 'approve') {
      serverDb.approveAssignment(assignmentId || params.id, session.name);
      return NextResponse.json({ success: true });
    }
    if (action === 'rework') {
      serverDb.rejectAssignmentForRework(
        assignmentId || params.id,
        reason || 'Quality Check Failed',
        session.name,
        session.userId
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error processing verification update' },
      { status: 500 }
    );
  }
}

