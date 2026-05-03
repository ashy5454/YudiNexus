import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { encrypt, encryptRefresh, setAuthCookies } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash || !['EMPLOYEE', 'FOUNDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Handle non-active statuses with clear messages
    if (user.status === 'PENDING') {
      return NextResponse.json({ error: 'Please verify your email first.' }, { status: 403 });
    }
    if (user.status === 'AWAITING_APPROVAL') {
      return NextResponse.json({ 
        error: 'Awaiting Approval', 
        pending: true,
        message: 'Your account is awaiting admin approval. You will receive an email once approved.' 
      }, { status: 403 });
    }
    if (user.status === 'REJECTED') {
      return NextResponse.json({ error: 'Your registration was not approved. Please contact your administrator.' }, { status: 403 });
    }
    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload = { sub: user.id, id: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` };
    const accessToken = await encrypt(payload);
    const refreshToken = await encryptRefresh({ sub: user.id });
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
