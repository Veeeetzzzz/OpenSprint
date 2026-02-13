import { Request } from 'express';

const createRequestError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

export const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw createRequestError('Authentication required', 401);
  }
  return req.user;
};

export const getProjectAccessContext = (req: Request) => {
  if (!req.projectAccess) {
    throw createRequestError('Project access context missing', 403);
  }
  return req.projectAccess;
};
