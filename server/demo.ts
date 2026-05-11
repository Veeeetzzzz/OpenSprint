import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { config } from './config/env.js';

const DEMO_USER_ID = 'demo-user-id';
const DEMO_PROJECT_ID = 'demo-project-id';

export const ensureDemoSeedData = async (prisma: PrismaClient) => {
  const passwordHash = await bcrypt.hash(config.DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      email: config.DEMO_USER_EMAIL,
      name: config.DEMO_USER_NAME,
      password: passwordHash,
      isActive: true,
    },
    create: {
      id: DEMO_USER_ID,
      email: config.DEMO_USER_EMAIL,
      name: config.DEMO_USER_NAME,
      password: passwordHash,
      isActive: true,
    },
  });

  const project = await prisma.project.upsert({
    where: { key: 'DEMO' },
    update: {
      name: 'OpenSprint Demo',
      description: 'A seeded workspace for trying OpenSprint with persisted data.',
      type: 'kanban',
    },
    create: {
      id: DEMO_PROJECT_ID,
      name: 'OpenSprint Demo',
      key: 'DEMO',
      description: 'A seeded workspace for trying OpenSprint with persisted data.',
      type: 'kanban',
    },
  });

  await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: DEMO_USER_ID,
        projectId: project.id,
      },
    },
    update: { role: 'admin' },
    create: {
      userId: DEMO_USER_ID,
      projectId: project.id,
      role: 'admin',
    },
  });

  const existingIssueCount = await prisma.issue.count({
    where: { projectId: project.id },
  });

  if (existingIssueCount > 0) {
    return;
  }

  await prisma.issue.createMany({
    data: [
      {
        title: 'Shape the first sprint',
        description: 'Create a small, focused sprint plan and confirm project priorities.',
        type: 'story',
        status: 'todo',
        priority: 'high',
        projectId: project.id,
        reporterId: DEMO_USER_ID,
        assigneeId: DEMO_USER_ID,
        estimate: 5,
      },
      {
        title: 'Review backlog health',
        description: 'Sort the backlog by priority and identify stale work.',
        type: 'task',
        status: 'inProgress',
        priority: 'medium',
        projectId: project.id,
        reporterId: DEMO_USER_ID,
        assigneeId: DEMO_USER_ID,
        estimate: 3,
      },
      {
        title: 'Publish release notes',
        description: 'Summarize completed work for the team.',
        type: 'task',
        status: 'done',
        priority: 'low',
        projectId: project.id,
        reporterId: DEMO_USER_ID,
        assigneeId: DEMO_USER_ID,
        estimate: 2,
      },
    ],
  });
};
