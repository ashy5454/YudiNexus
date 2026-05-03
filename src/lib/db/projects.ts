import prisma from './prisma';
import { ProjectStatus, ProjectType } from '@prisma/client';

export async function createProject(data: {
  name: string;
  description?: string;
  type: ProjectType;
  ownerId: string;
  startDate?: Date;
  endDate?: Date;
  icon?: string;
  color?: string;
}) {
  return await prisma.project.create({
    data,
  });
}

export async function getProjectsByOwner(ownerId: string) {
  return await prisma.project.findMany({
    where: { ownerId },
    include: {
      _count: {
        select: { tasks: true, sprints: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
      _count: {
        select: { tasks: true, sprints: true },
      },
    },
  });
}

export async function updateProject(id: string, data: Partial<{
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  icon: string;
  color: string;
}>) {
  return await prisma.project.update({
    where: { id },
    data,
  });
}
