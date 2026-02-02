import express from 'express';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess } from '../middleware/projectAccess';
import { prisma } from '../db/prisma';

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
// Get issues for a project
router.get('/', authenticate, async (req, res, next) => {
  try {
    const parsedQuery = issueQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw createError('Invalid query parameters', 400);
    }

    const { projectId, status, type, priority } = parsedQuery.data;

    // Check if user has access to the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user!.id,
          projectId: projectId as string,
        },
      },
    });

    if (!projectMember) {
      throw createError('Access denied: You are not a member of this project', 403);
    }

    const where: any = { projectId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        labels: {
          include: { label: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      },
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
    const parsedBody = issueCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid issue payload', 400);
    }

    const { title, description, type, priority, assigneeId, estimate, epicId } = parsedBody.data;
    const projectId = req.projectAccess!.projectId;

    if (assigneeId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId,
          },
        },
      });
      if (!assigneeMembership) {
        throw createError('Assignee must be a project member', 400);
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'medium',
        projectId,
        reporterId: req.user!.id,
        assigneeId,
        estimate,
        epicId,
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
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
    const { id } = req.params;
    const parsedBody = issueUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid issue update payload', 400);
    }

    const updateData = parsedBody.data;

    if (Object.keys(updateData).length === 0) {
      throw createError('No fields provided for update', 400);
    }

    // First get the issue to check project access
    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      select: { projectId: true }
    });

    if (!existingIssue) {
      throw createError('Issue not found', 404);
    }

    // Check if user has access to the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user!.id,
          projectId: existingIssue.projectId,
        },
      },
    });

    if (!projectMember) {
      throw createError('Access denied: You are not a member of this project', 403);
    }

    if (updateData.assigneeId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: updateData.assigneeId,
            projectId: existingIssue.projectId,
          },
        },
      });
      if (!assigneeMembership) {
        throw createError('Assignee must be a project member', 400);
      }
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
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
    const { id } = req.params;

    // First get the issue to check project access
    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      select: { projectId: true }
    });

    if (!existingIssue) {
      throw createError('Issue not found', 404);
    }

    // Check if user has admin access to the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user!.id,
          projectId: existingIssue.projectId,
        },
      },
    });

    if (!projectMember || projectMember.role !== 'admin') {
      throw createError('Access denied: Admin role required', 403);
    }

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

export { router as issueRoutes }; 