import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, UserRole } from '../types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ma_ashapuri_tuff_factory_portal_super_secret_jwt_key_2026'
);

const COOKIE_NAME = 'ashapuri_factory_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  line_assigned?: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function clearSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
}
