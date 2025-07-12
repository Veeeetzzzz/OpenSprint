import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

// Extend Request interface to include project access info
declare global {
  namespace Express {
    interface Request {
      projectAccess?: {
        projectId: string;
        role: 'admin' | 'member' | 'viewer';
        canEdit: boolean;
        canDelete: boolean;
        canManageMembers: boolean;
      };
    }
  }
}

// Project access middleware - checks if user has access to project
export const requireProjectAccess = (minRole: 'viewer' | 'member' | 'admin' = 'viewer') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        throw createError('Project ID required', 400);
      }

      // Check if user is a member of the project
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: projectId,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              key: true,
            },
          },
        },
      });

      if (!projectMember) {
        throw createError('Access denied: You are not a member of this project', 403);
      }

      // Check role hierarchy
      const roleHierarchy = { viewer: 0, member: 1, admin: 2 };
      const userRoleLevel = roleHierarchy[projectMember.role as keyof typeof roleHierarchy];
      const requiredRoleLevel = roleHierarchy[minRole];

      if (userRoleLevel < requiredRoleLevel) {
        throw createError(`Access denied: ${minRole} role required`, 403);
      }

      // Set project access info
      req.projectAccess = {
        projectId: projectId,
        role: projectMember.role as 'admin' | 'member' | 'viewer',
        canEdit: userRoleLevel >= roleHierarchy.member,
        canDelete: userRoleLevel >= roleHierarchy.admin,
        canManageMembers: userRoleLevel >= roleHierarchy.admin,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Project admin middleware - shorthand for admin access
export const requireProjectAdmin = requireProjectAccess('admin');

// Project member middleware - shorthand for member access
export const requireProjectMember = requireProjectAccess('member');

// Check if user can manage project members
export const canManageProjectMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.projectAccess || !req.projectAccess.canManageMembers) {
      throw createError('Access denied: Project admin role required', 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to get user's projects
export const getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const userProjects = await prisma.projectMember.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    req.body.userProjects = userProjects.map(pm => ({
      ...pm.project,
      role: pm.role,
    }));

    next();
  } catch (error) {
    next(error);
  }
}; 