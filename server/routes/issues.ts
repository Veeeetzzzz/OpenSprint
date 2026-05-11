import express from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { requireProjectAccess } from '../middleware/projectAccess.js';
import { prisma } from '../db/prisma.js';
import { getAuthenticatedUser, getProjectAccessContext } from './requestContext.js';
import { roleMeetsMinimum, type ProjectRole } from '../lib/access.js';

const router = express.Router();

const issueStatusValues = ['backlog', 'todo', 'inProgress', 'done'] as const;
const issueTypeValues = ['story', 'task', 'bug', 'epic'] as const;
const issuePriorityValues = ['lowest', 'low', 'medium', 'high', 'highest'] as const;

const issueQuerySchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(issueStatusValues).optional(),
  type: z.enum(issueTypeValues).optional(),
  priority: z.enum(issuePriorityValues).optional(),
});

const issueCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(issueTypeValues),
  priority: z.enum(issuePriorityValues).optional(),
  assigneeId: z.string().optional(),
  estimate: z.number().int().min(0).optional(),
  epicId: z.string().optional(),
});

const issueUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    type: z.enum(issueTypeValues).optional(),
    status: z.enum(issueStatusValues).optional(),
    priority: z.enum(issuePriorityValues).optional(),
    estimate: z.number().int().min(0).nullable().optional(),
    assigneeId: z.string().nullable().optional(),
    epicId: z.string().nullable().optional(),
  })
  .strict();

const commentCreateSchema = z.object({
  content: z.string().trim().min(1),
});

const issueInclude = {
  reporter: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  assignee: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  labels: {
    include: { label: true },
  },
  comments: {
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.IssueInclude;

const requireProjectRole = async (
  projectId: string,
  userId: string,
  minRole: ProjectRole
) => {
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!projectMember) {
    throw createError('Access denied: You are not a member of this project', 403);
  }

  if (!roleMeetsMinimum(projectMember.role, minRole)) {
    throw createError(`Access denied: ${minRole} role required`, 403);
  }

  return projectMember;
};

const validateIssueRelations = async (
  projectId: string,
  data: { assigneeId?: string | null; epicId?: string | null },
  currentIssueId?: string
) => {
  if (data.assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: data.assigneeId,
          projectId,
        },
      },
    });
    if (!assigneeMembership) {
      throw createError('Assignee must be a project member', 400);
    }
  }

  if (data.epicId) {
    if (data.epicId === currentIssueId) {
      throw createError('Issue cannot use itself as an epic', 400);
    }

    const epic = await prisma.issue.findFirst({
      where: {
        id: data.epicId,
        projectId,
        type: 'epic',
      },
      select: { id: true },
    });
    if (!epic) {
      throw createError('Epic must be an epic issue in the same project', 400);
    }
  }
};

const getIssueOrThrow = async (id: string) => {
  const issue = await prisma.issue.findUnique({
    where: { id },
    select: { projectId: true },
  });

  if (!issue) {
    throw createError('Issue not found', 404);
  }

  return issue;
};
// Get issues for a project
router.get('/', authenticate, async (req, res, next) => {
  try {
    const requester = getAuthenticatedUser(req);

    const parsedQuery = issueQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw createError('Invalid query parameters', 400);
    }

    const { projectId, status, type, priority } = parsedQuery.data;

    // Check if user has access to the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: requester.id,
          projectId: projectId as string,
        },
      },
    });

    if (!projectMember) {
      throw createError('Access denied: You are not a member of this project', 403);
    }

    const where: Prisma.IssueWhereInput = { projectId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const issues = await prisma.issue.findMany({
      where,
      include: issueInclude,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
});

// Create issue
router.post('/', authenticate, requireProjectAccess('member'), async (req, res, next) => {
  try {
    const requester = getAuthenticatedUser(req);
    const projectAccess = getProjectAccessContext(req);

    const parsedBody = issueCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid issue payload', 400);
    }

    const { title, description, type, priority, assigneeId, estimate, epicId } = parsedBody.data;
    const projectId = projectAccess.projectId;

    await validateIssueRelations(projectId, { assigneeId, epicId });

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'medium',
        projectId,
        reporterId: requester.id,
        assigneeId,
        estimate,
        epicId,
      },
      include: issueInclude,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
});

// Update issue
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const requester = getAuthenticatedUser(req);

    const { id } = req.params;
    const parsedBody = issueUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid issue update payload', 400);
    }

    const updateData = parsedBody.data;

    if (Object.keys(updateData).length === 0) {
      throw createError('No fields provided for update', 400);
    }

    const existingIssue = await getIssueOrThrow(id);
    await requireProjectRole(existingIssue.projectId, requester.id, 'member');
    await validateIssueRelations(existingIssue.projectId, updateData, id);

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: issueInclude,
    });

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
});

// Delete issue
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const requester = getAuthenticatedUser(req);

    const { id } = req.params;

    const existingIssue = await getIssueOrThrow(id);
    await requireProjectRole(existingIssue.projectId, requester.id, 'admin');

    await prisma.issue.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', authenticate, async (req, res, next) => {
  try {
    const requester = getAuthenticatedUser(req);
    const { id } = req.params;
    const parsedBody = commentCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid comment payload', 400);
    }

    const existingIssue = await getIssueOrThrow(id);
    await requireProjectRole(existingIssue.projectId, requester.id, 'member');

    await prisma.$transaction([
      prisma.comment.create({
        data: {
          content: parsedBody.data.content,
          issueId: id,
          authorId: requester.id,
        },
      }),
      prisma.issue.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
    ]);

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: issueInclude,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
});

export { router as issueRoutes };
