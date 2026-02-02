import express from 'express';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess, getUserProjects } from '../middleware/projectAccess';
import { prisma } from '../db/prisma';

const router = express.Router();

const projectTypeValues = ['scrum', 'kanban'] as const;
const projectRoleValues = ['admin', 'member', 'viewer'] as const;
const projectKeyRegex = /^[A-Z][A-Z0-9_]{1,9}$/;

const projectCreateSchema = z.object({
  name: z.string().min(1),
  key: z.string().regex(projectKeyRegex),
  description: z.string().optional(),
  type: z.enum(projectTypeValues).optional(),
});

const projectUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    key: z.string().regex(projectKeyRegex).optional(),
    description: z.string().nullable().optional(),
    type: z.enum(projectTypeValues).optional(),
  })
  .strict();

const projectMemberCreateSchema = z.object({
  email: z.string().email(),
  role: z.enum(projectRoleValues).optional(),
});

const projectMemberUpdateSchema = z.object({
  role: z.enum(projectRoleValues),
});
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
    const parsedBody = projectCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid project payload', 400);
    }

    const { name, key, description, type } = parsedBody.data;

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
    const parsedBody = projectUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid project update payload', 400);
    }

    const updateData = parsedBody.data;

    if (Object.keys(updateData).length === 0) {
      throw createError('No fields provided for update', 400);
    }

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
    const parsedBody = projectMemberCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid member payload', 400);
    }

    const { email, role = 'member' } = parsedBody.data;

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
    const parsedBody = projectMemberUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw createError('Invalid member update payload', 400);
    }

    const { role } = parsedBody.data;

    const existingMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
    });

    if (!existingMember) {
      throw createError('Project member not found', 404);
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        id: memberId,
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

    const existingMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
    });

    if (!existingMember) {
      throw createError('Project member not found', 404);
    }

    await prisma.projectMember.delete({
      where: {
        id: memberId,
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