import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone, companyName, designation } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        companyName,
        designation,
        role: 'FOUNDER',
        status: 'PENDING',
      },
    });

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        purpose: 'EMAIL_VERIFY',
        expiresAt,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, firstName, otp, 'FOUNDER');

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Founder register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
