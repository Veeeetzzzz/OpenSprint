import express, { type NextFunction, type Request, type Response } from 'express';
import type { AddressInfo } from 'net';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type ProjectRole = 'admin' | 'member' | 'viewer';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    projectMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../db/prisma.js', () => ({ prisma: prismaMock }));

vi.mock('../middleware/auth.js', () => ({
  authenticate: (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: 'acting-user',
      email: 'ada@example.com',
      name: 'Ada',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    next();
  },
}));

let projectRoutes: Awaited<typeof import('./projects.js')>['projectRoutes'];
let errorHandler: Awaited<typeof import('../middleware/errorHandler.js')>['errorHandler'];

const user = {
  id: 'target-user',
  name: 'Grace',
  email: 'grace@example.com',
  avatarUrl: null,
};

const actingMembership = (role: ProjectRole) => ({
  id: `${role}-acting-member`,
  userId: 'acting-user',
  projectId: 'project-1',
  role,
});

const targetMembership = (role: ProjectRole) => ({
  id: 'member-1',
  userId: 'target-user',
  projectId: 'project-1',
  role,
});

const memberResponse = (role: ProjectRole) => ({
  ...targetMembership(role),
  user,
});

const requestProjectRoute = async (path: string, init: RequestInit) => {
  const app = express();
  app.use(express.json());
  app.use('/api/projects', projectRoutes);
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
  ({ projectRoutes } = await import('./projects.js'));
  ({ errorHandler } = await import('../middleware/errorHandler.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('project member management routes', () => {
  it('rejects demoting the final project admin', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('admin'));
    prismaMock.projectMember.count.mockResolvedValue(1);

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'member' }),
    });

    expect(response.status).toBe(400);
    expect(prismaMock.projectMember.update).not.toHaveBeenCalled();
  });

  it('rejects removing the final project admin', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('admin'));
    prismaMock.projectMember.count.mockResolvedValue(1);

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'DELETE',
    });

    expect(response.status).toBe(400);
    expect(prismaMock.projectMember.delete).not.toHaveBeenCalled();
  });

  it('allows demoting an admin when another admin remains', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('admin'));
    prismaMock.projectMember.count.mockResolvedValue(2);
    prismaMock.projectMember.update.mockResolvedValue(memberResponse('member'));

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'member' }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.projectMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'member-1' },
        data: { role: 'member' },
      })
    );
  });

  it('allows removing an admin when another admin remains', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('admin'));
    prismaMock.projectMember.count.mockResolvedValue(2);
    prismaMock.projectMember.delete.mockResolvedValue(memberResponse('admin'));

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    expect(prismaMock.projectMember.delete).toHaveBeenCalledWith({
      where: { id: 'member-1' },
    });
  });

  it('allows changing or removing non-admin members without requiring multiple admins', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('member'));
    prismaMock.projectMember.count.mockResolvedValue(1);
    prismaMock.projectMember.update.mockResolvedValue(memberResponse('viewer'));

    const updateResponse = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'viewer' }),
    });

    expect(updateResponse.status).toBe(200);
    expect(prismaMock.projectMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { role: 'viewer' },
      })
    );

    vi.clearAllMocks();
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(targetMembership('viewer'));
    prismaMock.projectMember.count.mockResolvedValue(1);
    prismaMock.projectMember.delete.mockResolvedValue(memberResponse('viewer'));

    const deleteResponse = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);
    expect(prismaMock.projectMember.delete).toHaveBeenCalledWith({
      where: { id: 'member-1' },
    });
  });

  it('rejects non-admin member management before target lookup or admin counting', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('member'));

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'viewer' }),
    });

    expect(response.status).toBe(403);
    expect(prismaMock.projectMember.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.projectMember.count).not.toHaveBeenCalled();
    expect(prismaMock.projectMember.update).not.toHaveBeenCalled();
  });

  it('rejects target members outside the project', async () => {
    prismaMock.projectMember.findUnique.mockResolvedValue(actingMembership('admin'));
    prismaMock.projectMember.findFirst.mockResolvedValue(null);

    const response = await requestProjectRoute('/api/projects/project-1/members/member-1', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    expect(prismaMock.projectMember.count).not.toHaveBeenCalled();
    expect(prismaMock.projectMember.delete).not.toHaveBeenCalled();
  });
});
