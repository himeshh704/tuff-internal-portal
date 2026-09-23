import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/dbStore';
import { createSession } from '@/lib/server/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const user = serverDb.findUserByEmail(cleanEmail);

    if (!user || user.passwordHash.trim() !== cleanPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Create real JWT Session Cookie
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      line_assigned: user.line_assigned,
    });

    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Server authentication failure. Please try again.' },
      { status: 500 }
    );
  }
}
