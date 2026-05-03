import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/utils';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'FOUNDER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'AWAITING_APPROVAL';
    const role = searchParams.get('role');

    // Support comma-separated statuses: e.g., status=PENDING,AWAITING_APPROVAL
    const statuses = status.split(',').map(s => s.trim());

    const where: any = { status: { in: statuses } };
    if (role) where.role = role;

    if (session.role === 'FOUNDER') {
      // Founders can only see employees in their company
      where.role = 'EMPLOYEE';
      const founder = await prisma.user.findUnique({ where: { id: session.id } });
      if (founder?.companyName) {
        where.companyName = founder.companyName;
      }
    } else if (session.role === 'SUPER_ADMIN') {
      // Super admin reviews Founders (unless role explicitly specified)
      if (!role) where.role = 'FOUNDER';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        companyName: true,
        designation: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'FOUNDER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action, reason } = await request.json();

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security: Founder can only approve employees in their own company
    if (session.role === 'FOUNDER') {
      const founder = await prisma.user.findUnique({ where: { id: session.id } });
      if (
        !founder ||
        founder.companyName !== userToUpdate.companyName ||
        userToUpdate.role !== 'EMPLOYEE'
      ) {
        return NextResponse.json(
          { error: 'Forbidden: You can only approve employees for your company' },
          { status: 403 }
        );
      }
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          approvedById: session.id,
          approvedAt: new Date(),
        },
      });

      try {
        await sendApprovalEmail(
          userToUpdate.email,
          userToUpdate.firstName,
          userToUpdate.role as 'FOUNDER' | 'EMPLOYEE',
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/${userToUpdate.role === 'FOUNDER' ? 'founder/' : ''}login`
        );
      } catch (emailErr) {
        console.error('Approval email failed (non-fatal):', emailErr);
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'REJECTED', rejectionReason: reason || 'Registration criteria not met.' },
      });

      try {
        await sendRejectionEmail(
          userToUpdate.email,
          userToUpdate.firstName,
          reason || 'Registration criteria not met.'
        );
      } catch (emailErr) {
        console.error('Rejection email failed (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'FOUNDER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security: Founder can only delete employees in their own company
    if (session.role === 'FOUNDER') {
      const founder = await prisma.user.findUnique({ where: { id: session.id } });
      if (
        !founder ||
        founder.companyName !== userToDelete.companyName ||
        userToDelete.role !== 'EMPLOYEE'
      ) {
        return NextResponse.json(
          { error: 'Forbidden: You can only delete employees from your company' },
          { status: 403 }
        );
      }
    }

    // Instead of completely deleting from DB (which would cause foreign key errors with tasks),
    // we can either set their status to 'INACTIVE' or actually delete them if we delete related records first.
    // Let's set them to INACTIVE to keep task history intact.
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
