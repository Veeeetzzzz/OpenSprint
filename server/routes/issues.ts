import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get all issues
router.get('/', async (req, res, next) => {
  try {
    const { projectId, status, type, priority } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
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
router.post('/', async (req, res, next) => {
  try {
    const { title, description, type, priority, projectId, reporterId, assigneeId } = req.body;

    if (!title || !type || !projectId || !reporterId) {
      throw createError('Title, type, projectId, and reporterId are required', 400);
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'medium',
        projectId,
        reporterId,
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
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

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