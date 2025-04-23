export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export type IssueType = 'story' | 'task' | 'bug' | 'epic';

export type IssueStatus = 'todo' | 'backlog' | 'selected' | 'inProgress' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assignee?: User;
  reporter: User;
  createdAt: Date;
  updatedAt: Date;
  estimate?: number;
  epic?: Issue;
  comments: Comment[];
  attachments: Attachment[];
  labels: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  uploadedBy: User;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  lead: User;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}