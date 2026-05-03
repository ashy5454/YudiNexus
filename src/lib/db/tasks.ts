import prisma from './prisma';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';

export async function createTask(data: {
  taskNumber: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  storyPoints?: number;
  estimatedHours?: number;
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
}) {
  return await prisma.task.create({
    data,
  });
}

export async function getTasksByProject(projectId: string) {
  return await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
    },
    orderBy: { position: 'asc' },
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const data: any = { status };
  if (status === TaskStatus.DONE) {
    data.completedAt = new Date();
  }
  return await prisma.task.update({
    where: { id },
    data,
  });
}

export async function logTime(data: {
  taskId: string;
  userId: string;
  loggedHours: number;
  description?: string;
  logDate: Date;
}) {
  return await prisma.$transaction(async (tx) => {
    const log = await tx.timeLog.create({
      data,
    });
    
    await tx.task.update({
      where: { id: data.taskId },
      data: {
        loggedHours: {
          increment: data.loggedHours,
        },
      },
    });
    
    return log;
  });
}
