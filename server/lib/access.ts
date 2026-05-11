export type ProjectRole = 'admin' | 'member' | 'viewer';

const roleHierarchy: Record<ProjectRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
};

export const roleMeetsMinimum = (role: string, minRole: ProjectRole) => {
  const roleLevel = roleHierarchy[role as ProjectRole] ?? -1;
  return roleLevel >= roleHierarchy[minRole];
};

export const isLastAdminChangeBlocked = (
  existingRole: string,
  nextRole: string | null,
  adminCount: number
) => {
  return existingRole === 'admin' && nextRole !== 'admin' && adminCount <= 1;
};
