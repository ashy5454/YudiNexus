import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      companyName: true,
    }
  });
  return NextResponse.json(users);
}
