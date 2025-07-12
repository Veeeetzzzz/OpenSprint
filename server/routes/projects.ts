import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess, requireProjectAdmin, getUserProjects } from '../middleware/projectAccess';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's projects
router.get('/', authenticate, getUserProjects, async (req, res, next) => {
  try {
    const projects = req.body.userProjects;

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, key, description, type } = req.body;

    if (!name || !key) {
      throw createError('Name and key are required', 400);
    }

    // Create project and add creator as admin
    const project = await prisma.project.create({
      data: {
        name,
        key,
        description,
        type: type || 'scrum',
        members: {
          create: {
            userId: req.user!.id,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:projectId', authenticate, requireProjectAccess('viewer'), async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        issues: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            },
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      }
    });

    if (!project) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...project,
        userRole: req.projectAccess?.role,
        permissions: {
          canEdit: req.projectAccess?.canEdit,
          canDelete: req.projectAccess?.canDelete,
          canManageMembers: req.projectAccess?.canManageMembers,
        }
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:projectId', authenticate, requireProjectAccess('admin'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// Add project member
router.post('/:projectId/members', authenticate, requireProjectAccess('admin'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'member' } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId,
        },
      },
    });

    if (existingMember) {
      throw createError('User is already a member of this project', 409);
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: projectId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
});

// Update project member role
router.put('/:projectId/members/:memberId', authenticate, requireProjectAccess('admin'), async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw createError('Role is required', 400);
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        id: memberId,
        projectId: projectId,
      },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
});

// Remove project member
router.delete('/:projectId/members/:memberId', authenticate, requireProjectAccess('admin'), async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;

    await prisma.projectMember.delete({
      where: {
        id: memberId,
        projectId: projectId,
      },
    });

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

export { router as projectRoutes }; 