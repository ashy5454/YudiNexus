import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      where.completedAt = { gte: startDate, lt: endDate };
      where.status = 'DONE';
    }

    // Employees see only their assigned tasks
    if (session.role === 'EMPLOYEE') {
      where.assigneeId = session.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        assignee: { select: { firstName: true, lastName: true, email: true } },
        project: { select: { name: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['FOUNDER', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, projectId, assigneeId, priority, storyPoints, status, type, dueDate } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 });
    }

    const taskCount = await prisma.task.count();
    const taskNumber = `TASK-${String(taskCount + 1).padStart(3, '0')}`;

    const task = await prisma.task.create({
      data: {
        taskNumber,
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        priority: priority || 'MEDIUM',
        storyPoints: storyPoints || null,
        status: status || 'TODO',
        type: type || 'TASK',
        reporterId: session.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignee: { select: { firstName: true, lastName: true, email: true } },
        project: { select: { name: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId, status, assigneeId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (status === 'DONE') updateData.completedAt = new Date();

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { firstName: true, lastName: true, email: true } },
        project: { select: { name: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['FOUNDER', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // Delete related records first (FK constraints)
    await prisma.timeLog.deleteMany({ where: { taskId } });
    // Delete subtasks
    await prisma.task.deleteMany({ where: { parentTaskId: taskId } });
    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
