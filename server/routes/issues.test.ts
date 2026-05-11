import express, { type NextFunction, type Request, type Response } from 'express';
import type { AddressInfo } from 'net';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    projectMember: {
      findUnique: vi.fn(),
    },
    issue: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../db/prisma.js', () => ({ prisma: prismaMock }));

vi.mock('../middleware/auth.js', () => ({
  authenticate: (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: 'user-1',
      email: 'ada@example.com',
      name: 'Ada',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    next();
  },
}));

let issueRoutes: Awaited<typeof import('./issues.js')>['issueRoutes'];
let errorHandler: Awaited<typeof import('../middleware/errorHandler.js')>['errorHandler'];

const issueResponse = {
  id: 'issue-1',
  title: 'Persist board state',
  description: null,
  type: 'task',
  status: 'todo',
  priority: 'medium',
  projectId: 'project-1',
  reporterId: 'user-1',
  assigneeId: null,
  estimate: null,
  epicId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  reporter: {
    id: 'user-1',
    name: 'Ada',
    email: 'ada@example.com',
    avatarUrl: null,
  },
  assignee: null,
  labels: [],
  comments: [],
};

const member = (role: 'admin' | 'member' | 'viewer') => ({
  id: `${role}-member`,
  userId: 'user-1',
  projectId: 'project-1',
  role,
});

const requestIssueRoute = async (path: string, init: RequestInit) => {
  const app = express();
  app.use(express.json());
  app.use('/api/issues', issueRoutes);
  app.use(errorHandler);

  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'opensprint-test-secret-at-least-32-chars';
  process.env.NODE_ENV = 'test';
  ({ issueRoutes } = await import('./issues.js'));
  ({ errorHandler } = await import('../middleware/errorHandler.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('issue routes access control', () => {
  it('rejects viewer issue updates', async () => {
    prismaMock.issue.findUnique.mockResolvedValue({ projectId: 'project-1' });
    prismaMock.projectMember.findUnique.mockResolvedValue(member('viewer'));

    const response = await requestIssueRoute('/api/issues/issue-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'done' }),
    });

    expect(response.status).toBe(403);
    expect(prismaMock.issue.update).not.toHaveBeenCalled();
  });

  it('allows members to create and update issues', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(member('member'));
    prismaMock.issue.create.mockResolvedValue(issueResponse);

    const createResponse = await requestIssueRoute('/api/issues', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'project-1',
        title: 'Persist board state',
        type: 'task',
      }),
    });

    expect(createResponse.status).toBe(201);
    expect(prismaMock.issue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 'project-1',
          reporterId: 'user-1',
          title: 'Persist board state',
        }),
      })
    );

    prismaMock.issue.findUnique.mockResolvedValue({ projectId: 'project-1' });
    prismaMock.projectMember.findUnique.mockResolvedValue(member('member'));
    prismaMock.issue.update.mockResolvedValue({ ...issueResponse, status: 'done' });

    const updateResponse = await requestIssueRoute('/api/issues/issue-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'done' }),
    });

    expect(updateResponse.status).toBe(200);
    expect(prismaMock.issue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'issue-1' },
        data: expect.objectContaining({ status: 'done' }),
      })
    );
  });

  it('keeps issue deletion admin-only', async () => {
    prismaMock.issue.findUnique.mockResolvedValue({ projectId: 'project-1' });
    prismaMock.projectMember.findUnique.mockResolvedValue(member('member'));

    const memberResponse = await requestIssueRoute('/api/issues/issue-1', {
      method: 'DELETE',
    });

    expect(memberResponse.status).toBe(403);
    expect(prismaMock.issue.delete).not.toHaveBeenCalled();

    prismaMock.issue.findUnique.mockResolvedValue({ projectId: 'project-1' });
    prismaMock.projectMember.findUnique.mockResolvedValue(member('admin'));
    prismaMock.issue.delete.mockResolvedValue(issueResponse);

    const adminResponse = await requestIssueRoute('/api/issues/issue-1', {
      method: 'DELETE',
    });

    expect(adminResponse.status).toBe(200);
    expect(prismaMock.issue.delete).toHaveBeenCalledWith({
      where: { id: 'issue-1' },
    });
  });

  it('rejects assignees and epics outside the project', async () => {
    prismaMock.projectMember.findUnique
      .mockResolvedValueOnce(member('member'))
      .mockResolvedValueOnce(null);

    const assigneeResponse = await requestIssueRoute('/api/issues', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'project-1',
        title: 'Assign cross-project user',
        type: 'task',
        assigneeId: 'other-user',
      }),
    });

    expect(assigneeResponse.status).toBe(400);
    expect(prismaMock.issue.create).not.toHaveBeenCalled();

    prismaMock.projectMember.findUnique.mockResolvedValue(member('member'));
    prismaMock.issue.findFirst.mockResolvedValue(null);

    const epicResponse = await requestIssueRoute('/api/issues', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'project-1',
        title: 'Attach cross-project epic',
        type: 'task',
        epicId: 'other-epic',
      }),
    });

    expect(epicResponse.status).toBe(400);
    expect(prismaMock.issue.create).not.toHaveBeenCalled();
  });
});
