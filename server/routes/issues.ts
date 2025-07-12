import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess } from '../middleware/projectAccess';

const router = express.Router();
const prisma = new PrismaClient();

// Get issues for a project
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { projectId, status, type, priority } = req.query;

    if (!projectId) {
      throw createError('Project ID is required', 400);
    }

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

    const where: any = { projectId: projectId as string };
    if (status) where.status = status as string;
    if (type) where.type = type as string;
    if (priority) where.priority = priority as string;

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
    const { title, description, type, priority, assigneeId } = req.body;
    const projectId = req.projectAccess!.projectId;

    if (!title || !type) {
      throw createError('Title and type are required', 400);
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
    const updateData = req.body;

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