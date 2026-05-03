import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where: any = {};

    if (session.role === 'FOUNDER') {
      where.ownerId = session.id;
    } else if (session.role === 'EMPLOYEE') {
      // Employees see projects their tasks belong to (via assigneeId on tasks)
      // We find all distinct projectIds from tasks assigned to this employee
      const assignedTasks = await prisma.task.findMany({
        where: { assigneeId: session.id },
        select: { projectId: true },
        distinct: ['projectId'],
      });
      const projectIds = assignedTasks.map((t: any) => t.projectId);
      where.id = { in: projectIds };
    }
    // SUPER_ADMIN sees everything (no filter)

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { select: { id: true, status: true } },
        sprints: { select: { id: true, status: true } },
        owner: { select: { firstName: true, lastName: true, companyName: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'FOUNDER') {
      return NextResponse.json({ error: 'Only founders can create projects' }, { status: 401 });
    }

    const { name, description, type, status, startDate, endDate } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        type: type || 'SOFTWARE',
        status: status || 'ACTIVE',
        ownerId: session.id,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        tasks: { select: { id: true, status: true } },
        sprints: { select: { id: true, status: true } },
        owner: { select: { firstName: true, lastName: true, companyName: true } },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'FOUNDER') {
      return NextResponse.json({ error: 'Only founders can delete projects' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Verify ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete cascade: time logs → tasks → sprints → project
    const tasks = await prisma.task.findMany({ where: { projectId }, select: { id: true } });
    const taskIds = tasks.map((t: any) => t.id);
    if (taskIds.length > 0) {
      await prisma.timeLog.deleteMany({ where: { taskId: { in: taskIds } } });
    }
    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.sprint.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
