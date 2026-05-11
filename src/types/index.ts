export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export type IssueType = 'story' | 'task' | 'bug' | 'epic';

export type IssueStatus = 'todo' | 'backlog' | 'selected' | 'inProgress' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assignee?: User | null;
  reporter: User;
  createdAt: string;
  updatedAt: string;
  estimate?: number;
  epic?: Issue | null;
  comments: Comment[];
  attachments: Attachment[];
  labels: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  uploadedBy: User;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  type: 'scrum' | 'kanban';
  role?: 'admin' | 'member' | 'viewer';
  userRole?: 'admin' | 'member' | 'viewer';
  members?: ProjectMember[];
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canManageMembers?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
  user: User;
}
