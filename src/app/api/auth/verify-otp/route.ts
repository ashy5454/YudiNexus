import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json({ error: 'Missing userId or OTP' }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code: otp,
        purpose: 'EMAIL_VERIFY',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Move user to AWAITING_APPROVAL
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'AWAITING_APPROVAL' },
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      message:
        user.role === 'FOUNDER'
          ? 'Email verified! Your founder account is now pending approval from the YudiNex Super Admin. You will receive an email once approved.'
          : 'Email verified! Your account is pending approval from your organization admin.',
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
