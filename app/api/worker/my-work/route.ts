import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/server/auth';
import { serverDb } from '@/lib/server/dbStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in to view assigned work.' },
      { status: 401 }
    );
  }

  // Fetch only the logged in worker's assignments
  const myWork = serverDb.getWorkerAssignments(session.userId, session.name);

  return NextResponse.json({
    worker: {
      id: session.userId,
      name: session.name,
      role: session.role,
      line_assigned: session.line_assigned,
    },
    assignments: myWork,
  });
}

export async function POST(request: Request) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    const { action, assignmentId, addedQty } = await request.json();

    if (action === 'update_qty') {
      const updated = serverDb.updateWorkerQuantity(
        assignmentId,
        addedQty,
        session.userId,
        session.name
      );
      return NextResponse.json({ success: true, assignment: updated });
    }

    if (action === 'mark_complete') {
      const updated = serverDb.markAssignmentComplete(
        assignmentId,
        session.userId,
        session.name
      );
      return NextResponse.json({ success: true, assignment: updated });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error updating worker progress.' },
      { status: 400 }
    );
  }
}
