import { API_BASE_URL } from '@/lib/config';
import type { Issue, IssueType, Priority, Project, ProjectMember, User } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message?: string;
  };
};

type ApiUser = Omit<User, 'avatarUrl'> & {
  avatarUrl?: string | null;
};

type ApiComment = {
  id: string;
  content: string;
  author: ApiUser;
  createdAt: string;
  updatedAt: string;
};

type ApiIssueLabel = {
  label?: {
    name?: string;
  };
};

type ApiIssue = {
  id: string;
  title: string;
  description?: string | null;
  type: IssueType;
  status: Issue['status'];
  priority: Priority;
  reporter: ApiUser;
  assignee?: ApiUser | null;
  createdAt: string;
  updatedAt: string;
  estimate?: number | null;
  epic?: ApiIssue | null;
  comments?: ApiComment[];
  labels?: ApiIssueLabel[] | string[];
};

type ApiProjectMember = Omit<ProjectMember, 'user'> & {
  user: ApiUser;
};

type ApiProject = Omit<Project, 'members'> & {
  members?: ApiProjectMember[];
};

export type IssueCreateInput = {
  title: string;
  description?: string;
  type: IssueType;
  priority?: Priority;
  assigneeId?: string;
  estimate?: number;
  epicId?: string;
};

export type IssueUpdateInput = Partial<{
  title: string;
  description: string | null;
  type: IssueType;
  status: Issue['status'];
  priority: Priority;
  estimate: number | null;
  assigneeId: string | null;
  epicId: string | null;
}>;

const normalizeUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
});

const normalizeLabels = (labels: ApiIssue['labels'] = []) =>
  labels
    .map((label) => (typeof label === 'string' ? label : label.label?.name))
    .filter((label): label is string => Boolean(label));

export const normalizeIssue = (issue: ApiIssue): Issue => ({
  id: issue.id,
  title: issue.title,
  description: issue.description ?? '',
  type: issue.type,
  status: issue.status,
  priority: issue.priority,
  reporter: normalizeUser(issue.reporter),
  assignee: issue.assignee ? normalizeUser(issue.assignee) : null,
  createdAt: issue.createdAt,
  updatedAt: issue.updatedAt,
  estimate: issue.estimate ?? undefined,
  epic: issue.epic ? normalizeIssue(issue.epic) : null,
  comments: (issue.comments ?? []).map((comment) => ({
    ...comment,
    author: normalizeUser(comment.author),
  })),
  attachments: [],
  labels: normalizeLabels(issue.labels),
});

const normalizeProjectMember = (member: ApiProjectMember): ProjectMember => ({
  ...member,
  user: normalizeUser(member.user),
});

export const normalizeProject = (project: ApiProject): Project => ({
  ...project,
  description: project.description ?? null,
  members: project.members?.map(normalizeProjectMember),
});

const request = async <T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as ApiResponse<T>)
    : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request failed with ${response.status}`);
  }

  if (!payload) {
    throw new Error('Invalid response from server');
  }

  return payload.data;
};

export const getProjects = async (token: string) => {
  const projects = await request<ApiProject[]>(token, '/projects');
  return projects.map(normalizeProject);
};

export const getProject = async (token: string, projectId: string) => {
  const project = await request<ApiProject>(token, `/projects/${projectId}`);
  return normalizeProject(project);
};

export const getIssues = async (token: string, projectId: string) => {
  const params = new URLSearchParams({ projectId });
  const issues = await request<ApiIssue[]>(token, `/issues?${params.toString()}`);
  return issues.map(normalizeIssue);
};

export const createIssue = async (
  token: string,
  projectId: string,
  input: IssueCreateInput
) => {
  const issue = await request<ApiIssue>(token, '/issues', {
    method: 'POST',
    body: JSON.stringify({ ...input, projectId }),
  });
  return normalizeIssue(issue);
};

export const updateIssue = async (
  token: string,
  issueId: string,
  input: IssueUpdateInput
) => {
  const issue = await request<ApiIssue>(token, `/issues/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return normalizeIssue(issue);
};

export const deleteIssue = async (token: string, issueId: string) => {
  await request<unknown>(token, `/issues/${issueId}`, {
    method: 'DELETE',
  });
};

export const addIssueComment = async (token: string, issueId: string, content: string) => {
  const issue = await request<ApiIssue>(token, `/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return normalizeIssue(issue);
};
